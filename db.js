const { Pool } = require('pg');
const config = require('./config');

// Create connection pool
const pool = new Pool({
  connectionString: config.database.url,
  max: config.database.pool.max,
  min: config.database.pool.min,
  idleTimeoutMillis: config.database.pool.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.pool.connectionTimeoutMillis,
});

// Log pool events in development
pool.on('connect', () => {
  console.log('New client connected to pool');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Execute a query using the connection pool
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  
  // Log slow queries in development
  if (duration > 100) {
    console.log('Slow query:', { text, duration, rows: result.rowCount });
  }
  
  return result;
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Pool client
 */
async function getClient() {
  const client = await pool.connect();
  return client;
}

/**
 * Close all pool connections
 */
async function close() {
  await pool.end();
  console.log('Database pool closed');
}

/**
 * Get pool statistics
 * @returns {Object} Pool stats
 */
function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

// Store event in database
async function storeEvent(event) {
  const { name, properties, sessionId, userId, timestamp } = event;
  
  // Store timestamp as proper TIMESTAMP type
  const result = await query(
    'INSERT INTO events (name, properties, session_id, user_id, timestamp) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [name, JSON.stringify(properties), sessionId, userId, timestamp]
  );
  
  return result.rows[0];
}

// Update or create session
async function updateSession(sessionId) {
  if (!sessionId) return null;
  
  const result = await query(
    `INSERT INTO sessions (id, started_at, last_activity_at, event_count)
     VALUES ($1, NOW(), NOW(), 1)
     ON CONFLICT (id) DO UPDATE SET
       last_activity_at = NOW(),
       event_count = sessions.event_count + 1
     RETURNING *`,
    [sessionId]
  );
  
  return result.rows[0];
}

// Get session by ID
async function getSession(sessionId) {
  const result = await query(
    'SELECT * FROM sessions WHERE id = $1',
    [sessionId]
  );
  
  return result.rows[0] || null;
}

module.exports = {
  query,
  getClient,
  close,
  getPoolStats,
  storeEvent,
  updateSession,
  getSession
};
