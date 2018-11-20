const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const config = require('./config');
const { validateApiKey } = require('./middleware/auth');

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

// Health check endpoint
app.get('/health', (req, res) => {
  // Using string timestamp for simplicity (we can improve this later)
  const timestamp = new Date().toString();
  
  res.json({
    status: 'ok',
    timestamp: timestamp,
    uptime: process.uptime()
  });
});

// Apply API key authentication to all /api routes
app.use('/api', validateApiKey);

// Event tracking endpoint
app.post('/api/events', async (req, res) => {
  try {
    const { name, properties, sessionId } = req.body;

    // Basic validation
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        error: 'Event name is required and must be a string'
      });
    }

    if (name.length > 255) {
      return res.status(400).json({
        error: 'Event name must be 255 characters or less'
      });
    }

    // Properties are optional but must be an object if provided
    if (properties !== undefined && (typeof properties !== 'object' || Array.isArray(properties))) {
      return res.status(400).json({
        error: 'Properties must be an object'
      });
    }

    // Store the event
    // Note: properties are stored as-is without sanitization
    const event = {
      name: name,
      properties: properties || {},
      sessionId: sessionId || null,
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
    console.error('Error storing event:', error);
    res.status(500).json({
      error: 'Failed to store event'
    });
  }
});

// Query events endpoint
app.get('/api/events', async (req, res) => {
  try {
    const { startDate, endDate, name, sessionId, limit = 100, offset = 0 } = req.query;

    let queryText = 'SELECT * FROM events WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Filter by date range
    if (startDate) {
      paramCount++;
      queryText += ` AND timestamp >= $${paramCount}`;
      params.push(new Date(startDate));
    }

    if (endDate) {
      paramCount++;
      queryText += ` AND timestamp <= $${paramCount}`;
      params.push(new Date(endDate));
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

    // Order and pagination
    queryText += ' ORDER BY timestamp DESC';
    
    paramCount++;
    queryText += ` LIMIT $${paramCount}`;
    params.push(Math.min(parseInt(limit), 1000)); // Max 1000 results

    paramCount++;
    queryText += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset));

    const result = await db.query(queryText, params);

    res.json({
      events: result.rows,
      count: result.rows.length,
      offset: parseInt(offset),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error querying events:', error);
    res.status(500).json({
      error: 'Failed to query events'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Ultralytics server running on port ${PORT}`);
});

module.exports = app;
