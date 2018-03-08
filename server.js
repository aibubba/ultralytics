const express = require('express');
const db = require('./db');
const config = require('./config');

const app = express();
const PORT = config.port;

// Parse JSON bodies
app.use(express.json());

// TODO: Add rate limiting to prevent abuse

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

// Start server
app.listen(PORT, () => {
  console.log(`Ultralytics server running on port ${PORT}`);
});

module.exports = app;
