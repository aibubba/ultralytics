import { Pool, PoolClient, QueryResult } from 'pg';
import config from './config';

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

export interface EventInput {
  name: string;
  properties: Record<string, unknown>;
  sessionId: string | null;
  userId: string | null;
  timestamp: Date | string;
}

export interface StoredEvent {
  id: number;
}

export interface Session {
  id: string;
  started_at: Date;
  last_activity_at: Date;
  event_count: number;
}

export interface PoolStats {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
}

/**
 * Execute a query using the connection pool
 */
export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
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
 */
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect();
  return client;
}

/**
 * Close all pool connections
 */
export async function close(): Promise<void> {
  await pool.end();
  console.log('Database pool closed');
}

/**
 * Get pool statistics
 */
export function getPoolStats(): PoolStats {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}


/**
 * Store event in database
 */
export async function storeEvent(event: EventInput): Promise<StoredEvent> {
  const { name, properties, sessionId, userId, timestamp } = event;

  // Store timestamp as proper TIMESTAMP type
  const result = await query(
    'INSERT INTO events (name, properties, session_id, user_id, timestamp) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [name, JSON.stringify(properties), sessionId, userId, timestamp]
  );

  return result.rows[0];
}

/**
 * Update or create session
 */
export async function updateSession(sessionId: string): Promise<Session | null> {
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

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<Session | null> {
  const result = await query(
    'SELECT * FROM sessions WHERE id = $1',
    [sessionId]
  );

  return result.rows[0] || null;
}
