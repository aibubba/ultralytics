# Ultralytics

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

## Status

🚧 Under development

## License

MIT
