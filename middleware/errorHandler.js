/**
 * Centralized error handling middleware
 */

const { UltralyticsError, ErrorCodes } = require('../errors');

/**
 * Error handling middleware
 * Catches all errors and formats them consistently
 */
function errorHandler(err, req, res, next) {
  // Log the error
  console.error('Error:', {
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Handle known Ultralytics errors
  if (err instanceof UltralyticsError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: ErrorCodes.VALIDATION_ERROR,
      message: 'Invalid JSON in request body'
    });
  }

  // Handle unknown errors
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message;

  res.status(statusCode).json({
    error: ErrorCodes.INTERNAL_ERROR,
    message: message
  });
}

/**
 * 404 handler for unknown routes
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: ErrorCodes.NOT_FOUND,
    message: `Route ${req.method} ${req.path} not found`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
