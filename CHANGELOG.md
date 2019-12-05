# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
