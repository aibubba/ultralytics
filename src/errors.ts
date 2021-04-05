/**
 * Custom error classes for Ultralytics
 */

// Error codes
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMITED: 'RATE_LIMITED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export interface ErrorJSON {
  error: ErrorCode;
  message: string;
  field?: string;
}

/**
 * Base error class for Ultralytics
 */
export class UltralyticsError extends Error {
  public code: ErrorCode;
  public statusCode: number;

  constructor(message: string, code: ErrorCode, statusCode: number = 500) {
    super(message);
    this.name = 'UltralyticsError';
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorJSON {
    return {
      error: this.code,
      message: this.message
    };
  }
}


/**
 * Validation error (400)
 */
export class ValidationError extends UltralyticsError {
  public field: string | null;

  constructor(message: string, field: string | null = null) {
    super(message, ErrorCodes.VALIDATION_ERROR, 400);
    this.name = 'ValidationError';
    this.field = field;
  }

  toJSON(): ErrorJSON {
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
export class NotFoundError extends UltralyticsError {
  constructor(message: string = 'Resource not found') {
    super(message, ErrorCodes.NOT_FOUND, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends UltralyticsError {
  constructor(message: string = 'Unauthorized') {
    super(message, ErrorCodes.UNAUTHORIZED, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Database error (500)
 */
export class DatabaseError extends UltralyticsError {
  constructor(message: string = 'Database error occurred') {
    super(message, ErrorCodes.DATABASE_ERROR, 500);
    this.name = 'DatabaseError';
  }
}
