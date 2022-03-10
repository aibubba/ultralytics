import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import * as db from './db';
import config from './config';
import { validateApiKey, AuthenticatedRequest } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { ValidationError } from './errors';
import { validateEventData, validateBatchEventData } from './validation';
import dashboardRoutes from './routes/dashboard';
import exportRoutes from './routes/export';
import analyticsRoutes from './routes/analytics';

// Load OpenAPI specification
const swaggerDocument = YAML.load(path.join(__dirname, '../docs/openapi.yaml'));

const app = express();
const PORT = config.port;

// Parse JSON bodies
app.use(express.json());

// Request logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  }
});
app.use('/api', limiter);

// API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Ultralytics API Documentation'
}));

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  const timestamp = new Date().toISOString();

  // Check database connectivity
  let dbStatus = 'unknown';
  let dbLatency: number | null = null;


  try {
    const start = Date.now();
    await db.query('SELECT 1');
    dbLatency = Date.now() - start;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'disconnected';
    console.error('Database health check failed:', (error as Error).message);
  }

  // Get pool stats
  const poolStats = db.getPoolStats();

  const health = {
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: timestamp,
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      latencyMs: dbLatency,
      pool: poolStats
    }
  };

  const statusCode = dbStatus === 'connected' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Apply API key authentication to all /api routes
app.use('/api', validateApiKey);

// Event tracking endpoint
app.post('/api/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, properties, sessionId, userId } = req.body;

    // Schema validation
    const validation = validateEventData(req.body);
    if (!validation.valid) {
      throw new ValidationError(validation.errors || 'Validation failed');
    }


    // Store the event
    // Note: properties are stored as-is without sanitization
    const event = {
      name: name,
      properties: properties || {},
      sessionId: sessionId || null,
      userId: userId || null,
      timestamp: new Date()
    };

    const result = await db.storeEvent(event);

    // Update session tracking
    if (sessionId) {
      await db.updateSession(sessionId);
    }

    res.status(201).json({
      success: true,
      eventId: result.id
    });
  } catch (error) {
    next(error);
  }
});

// Batch event tracking endpoint
app.post('/api/events/batch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { events } = req.body;

    // Schema validation
    const validation = validateBatchEventData(req.body);
    if (!validation.valid) {
      throw new ValidationError(validation.errors || 'Validation failed');
    }

    // Store all events
    // BUG: For large batches (>1000), this can cause memory issues
    // and some events may be silently dropped
    const results: number[] = [];
    const sessionsToUpdate = new Set<string>();


    for (const eventData of events) {
      const event = {
        name: eventData.name,
        properties: eventData.properties || {},
        sessionId: eventData.sessionId || null,
        userId: eventData.userId || null,
        timestamp: eventData.timestamp ? new Date(eventData.timestamp) : new Date()
      };

      const result = await db.storeEvent(event);
      results.push(result.id);

      if (eventData.sessionId) {
        sessionsToUpdate.add(eventData.sessionId);
      }
    }

    // Update sessions
    for (const sessionId of sessionsToUpdate) {
      await db.updateSession(sessionId);
    }

    res.status(201).json({
      success: true,
      eventIds: results,
      count: results.length
    });
  } catch (error) {
    next(error);
  }
});

// Query events endpoint
app.get('/api/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, name, sessionId, userId } = req.query;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    let queryText = 'SELECT * FROM events WHERE 1=1';
    const params: unknown[] = [];
    let paramCount = 0;


    // Filter by date range
    if (startDate) {
      paramCount++;
      queryText += ` AND timestamp >= $${paramCount}`;
      params.push(new Date(startDate as string));
    }

    if (endDate) {
      paramCount++;
      queryText += ` AND timestamp <= $${paramCount}`;
      params.push(new Date(endDate as string));
    }

    // Filter by event name
    if (name) {
      paramCount++;
      queryText += ` AND name = $${paramCount}`;
      params.push(name);
    }

    // Filter by session ID
    if (sessionId) {
      paramCount++;
      queryText += ` AND session_id = $${paramCount}`;
      params.push(sessionId);
    }

    // Filter by user ID
    if (userId) {
      paramCount++;
      queryText += ` AND user_id = $${paramCount}`;
      params.push(userId);
    }

    // Order and pagination
    queryText += ' ORDER BY timestamp DESC';

    paramCount++;
    queryText += ` LIMIT $${paramCount}`;
    params.push(Math.min(limit, 1000)); // Max 1000 results

    paramCount++;
    queryText += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await db.query(queryText, params);

    res.json({
      events: result.rows,
      count: result.rows.length,
      offset: offset,
      limit: limit
    });
  } catch (error) {
    next(error);
  }
});

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// Export routes
app.use('/api/export', exportRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// 404 handler for unknown routes
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Ultralytics server running on port ${PORT}`);
  });
}

export default app;
