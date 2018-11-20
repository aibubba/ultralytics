/**
 * Configuration loader for Ultralytics
 * Loads configuration from environment variables
 */

require('dotenv').config();

const config = {
  // Server configuration
  port: parseInt(process.env.PORT, 10) || 3000,
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/ultralytics',
  },
  
  // API configuration
  api: {
    // Maximum events per request
    maxBatchSize: parseInt(process.env.MAX_BATCH_SIZE, 10) || 100,
  },
  
  // Rate limiting configuration
  rateLimit: {
    // Time window in milliseconds
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    // Maximum requests per window
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};

module.exports = config;
