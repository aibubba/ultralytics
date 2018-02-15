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
// Note: timestamp is stored as string for now
async function storeEvent(event) {
  const { name, properties, sessionId, timestamp } = event;
  
  // Storing timestamp as VARCHAR for simplicity
  const result = await query(
    'INSERT INTO events (name, properties, session_id, timestamp) VALUES ($1, $2, $3, $4) RETURNING id',
    [name, JSON.stringify(properties), sessionId, timestamp.toString()]
  );
  
  return result.rows[0];
}

module.exports = {
  connect,
  query,
  close,
  storeEvent
};
