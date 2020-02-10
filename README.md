# Ultralytics

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/aibubba/ultralytics/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Self-hosted analytics for web applications.

## Overview

Ultralytics is a privacy-focused, self-hosted analytics solution. Track user behavior on your websites without sending data to third parties.

## Installation

### Server Setup

1. Clone the repository:
```bash
git clone https://github.com/aibubba/ultralytics.git
cd ultralytics
```

2. Install dependencies:
```bash
npm install
```

3. Set up PostgreSQL and create a database:
```sql
CREATE DATABASE ultralytics;
```

4. Run the schema:
```bash
psql -d ultralytics -f schema.sql
```

5. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

6. Start the server:
```bash
npm start
```

### Docker Setup

The easiest way to get started is with Docker:

1. Clone the repository:
```bash
git clone https://github.com/aibubba/ultralytics.git
cd ultralytics
```

2. Start the services:
```bash
docker-compose up -d
```

This will start:
- The Ultralytics server on port 3000
- PostgreSQL database on port 5432

3. Verify it's running:
```bash
curl http://localhost:3000/health
```

To stop the services:
```bash
docker-compose down
```

To stop and remove all data:
```bash
docker-compose down -v
```

### Client Setup

Include the client library in your HTML:

```html
<script src="https://your-server.com/ultralytics.js"></script>
<script>
  Ultralytics.init({
    endpoint: 'https://your-server.com'
  });
</script>
```

## Configuration

Configuration is done via environment variables. See `.env.example` for all available options:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `MAX_BATCH_SIZE` - Maximum events per batch request (default: 100)
- `LOG_LEVEL` - Logging level (default: info)

## Basic Usage

### Tracking Events

```javascript
// Track a custom event
Ultralytics.track('button_click', {
  buttonId: 'signup-button',
  page: '/home'
});
```

## API Endpoints

### Health Check
```
GET /health
```

Returns server health status.

### Track Event
```
POST /api/events
Content-Type: application/json

{
  "name": "page_view",
  "properties": {
    "page": "/home"
  }
}
```

## Features

- **Privacy-focused**: All data stays on your servers
- **Lightweight client**: Simple JavaScript library for browsers
- **Session tracking**: Automatic session management with 30-minute timeout
- **Event querying**: Filter events by date range, event name, or session
- **Easy setup**: Docker and docker-compose included

## License

MIT - See [LICENSE](LICENSE) for details.
