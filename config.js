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
    // Connection pool configuration
    pool: {
      // Maximum number of clients in the pool
      max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
      // Minimum number of idle clients
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      // How long a client is allowed to remain idle before being closed (ms)
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10) || 30000,
      // How long to wait for a client to become available (ms)
      connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT, 10) || 2000,
    },
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
  
  // Data retention configuration
  retention: {
    // Number of days to keep events
    days: parseInt(process.env.RETENTION_DAYS, 10) || 90,
    // Cron schedule for cleanup job (default: 2am daily)
    schedule: process.env.RETENTION_SCHEDULE || '0 2 * * *',
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};

module.exports = config;
