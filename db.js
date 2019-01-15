const { Client } = require('pg');

// Database connection configuration
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/ultralytics';

let client = null;

async function connect() {
  if (client) {
    return client;
  }

  client = new Client({
    connectionString: connectionString
  });

  await client.connect();
  console.log('Connected to PostgreSQL database');
  return client;
}

async function query(text, params) {
  const db = await connect();
  return db.query(text, params);
}

async function close() {
  if (client) {
    await client.end();
    client = null;
  }
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
  connect,
  query,
  close,
  storeEvent,
  updateSession,
  getSession
};
