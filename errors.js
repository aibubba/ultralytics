/**
 * Custom error classes for Ultralytics
 */

// Error codes
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMITED: 'RATE_LIMITED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

/**
 * Base error class for Ultralytics
 */
class UltralyticsError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = 'UltralyticsError';
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message
    };
  }
}

/**
 * Validation error (400)
 */
class ValidationError extends UltralyticsError {
  constructor(message, field = null) {
    super(message, ErrorCodes.VALIDATION_ERROR, 400);
    this.name = 'ValidationError';
    this.field = field;
  }

  toJSON() {
    const json = super.toJSON();
    if (this.field) {
      json.field = this.field;
    }
    return json;
  }
}

/**
 * Not found error (404)
 */
class NotFoundError extends UltralyticsError {
  constructor(message = 'Resource not found') {
    super(message, ErrorCodes.NOT_FOUND, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized error (401)
 */
class UnauthorizedError extends UltralyticsError {
  constructor(message = 'Unauthorized') {
    super(message, ErrorCodes.UNAUTHORIZED, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Database error (500)
 */
class DatabaseError extends UltralyticsError {
  constructor(message = 'Database error occurred') {
    super(message, ErrorCodes.DATABASE_ERROR, 500);
    this.name = 'DatabaseError';
  }
}

module.exports = {
  ErrorCodes,
  UltralyticsError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  DatabaseError
};
