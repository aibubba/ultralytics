-- Ultralytics Schema
-- Initial database schema for event tracking

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    properties JSONB,
    session_id VARCHAR(255),
    -- Note: Using VARCHAR for timestamp for flexibility
    timestamp VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
