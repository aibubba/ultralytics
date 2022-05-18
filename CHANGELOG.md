# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security
- Fixed XSS vulnerability in event property storage. All string values in event properties are now sanitized to prevent script injection attacks. Users are strongly advised to upgrade.

## [0.4.0] - 2021-12-10

### Added
- Full TypeScript support for both server and client
- React hooks (`useUltralytics`) for React applications
- ES module build output for modern bundlers
- Kubernetes deployment manifests
- Nginx reverse proxy configuration for production
- API documentation with OpenAPI/Swagger UI at `/docs`
- Dashboard query endpoints (`/api/dashboard/summary`, `/api/dashboard/events-over-time`)
- Data export endpoint (`/api/export`) with CSV and JSON formats
- Database query performance logging with configurable thresholds

### Changed
- **BREAKING**: License changed from MIT to Apache 2.0
- Server and client code migrated to TypeScript
- Improved build tooling with Rollup ESM output
- Production Docker Compose configuration added

### Documentation
- Updated README with TypeScript and React examples
- Added API reference documentation

## [0.3.0] - 2020-12-15

### Added
- Dockerfile for containerized deployment
- Docker Compose configuration for local development
- Database migrations system using node-pg-migrate
- Jest test suite with server and client tests
- GitHub Actions CI pipeline
- Minified client build with source maps
- Database backup script with retention policy

### Changed
- Updated to Node.js 14 LTS
- Updated dependencies for security and performance

### Fixed
- Race condition in client session tracking

## [0.2.0] - 2019-12-05

### Added
- Request logging with Morgan middleware
- API key authentication for secure access
- Rate limiting to prevent abuse
- User identification (`identify()` method)
- Data retention policies with automated cleanup
- Batch event ingestion (`POST /api/events/batch`)
- Centralized error handling with error codes
- Database connection pooling for improved performance
- Enhanced health check with database status
- Event property validation with JSON Schema
- Database indexes for improved query performance

### Fixed
- Memory leak in client library event listeners

### Documentation
- Added CONTRIBUTING.md with contribution guidelines

## [0.1.0] - 2018-08-01

### Added
- Initial release of Ultralytics analytics platform
- Express-based server with PostgreSQL backend
- Event tracking endpoint (`POST /api/events`)
- Event query endpoint (`GET /api/events`) with date range filtering
- Browser client library with `init()` and `track()` methods
- Page view tracking (`trackPageView()`)
- Custom event tracking (`trackEvent()`)
- Session tracking with automatic 30-minute timeout
- Configuration via environment variables
- Health check endpoint

### Notes
- This is the first public release
- Self-hosted analytics for privacy-conscious applications
