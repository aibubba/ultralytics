-- Ultralytics Schema
-- Initial database schema for event tracking

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    properties JSONB,
    session_id VARCHAR(255),
    -- Fixed: Now using proper TIMESTAMP type instead of VARCHAR
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
