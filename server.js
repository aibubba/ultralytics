const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Start server
app.listen(PORT, () => {
  console.log(`Ultralytics server running on port ${PORT}`);
});

module.exports = app;
