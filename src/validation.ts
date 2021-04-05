/**
 * Event property validation using JSON Schema
 */

import Ajv, { ErrorObject, ValidateFunction } from 'ajv';

const ajv = new Ajv({ allErrors: true });

// Schema for event properties
const eventPropertiesSchema = {
  type: 'object',
  additionalProperties: {
    anyOf: [
      { type: 'string', maxLength: 1000 },
      { type: 'number' },
      { type: 'boolean' },
      { type: 'null' },
      {
        type: 'array',
        items: {
          anyOf: [
            { type: 'string', maxLength: 1000 },
            { type: 'number' },
            { type: 'boolean' }
          ]
        },
        maxItems: 100
      }
    ]
  },
  maxProperties: 50
};

// Schema for a single event
export const eventSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
      pattern: '^[a-zA-Z0-9_.-]+$'
    },
    properties: eventPropertiesSchema,
    sessionId: {
      type: ['string', 'null'],
      maxLength: 255
    },
    userId: {
      type: ['string', 'null'],
      maxLength: 255
    },
    timestamp: {
      type: ['string', 'null'],
      format: 'date-time'
    }
  },
  additionalProperties: false
};


// Schema for batch events
export const batchEventSchema = {
  type: 'object',
  required: ['events'],
  properties: {
    events: {
      type: 'array',
      items: eventSchema,
      minItems: 1,
      maxItems: 10000
    }
  },
  additionalProperties: false
};

// Compile validators
const validateEvent: ValidateFunction = ajv.compile(eventSchema);
const validateBatchEvents: ValidateFunction = ajv.compile(batchEventSchema);

export interface ValidationResult {
  valid: boolean;
  errors: string | null;
}

/**
 * Format AJV errors into readable messages
 */
function formatErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors) return '';
  return errors.map(err => {
    const path = err.instancePath || 'root';
    return `${path}: ${err.message}`;
  }).join('; ');
}

/**
 * Validate a single event
 */
export function validateEventData(event: unknown): ValidationResult {
  const valid = validateEvent(event);
  return {
    valid,
    errors: valid ? null : formatErrors(validateEvent.errors)
  };
}

/**
 * Validate batch events
 */
export function validateBatchEventData(data: unknown): ValidationResult {
  const valid = validateBatchEvents(data);
  return {
    valid,
    errors: valid ? null : formatErrors(validateBatchEvents.errors)
  };
}

// Note: This validation does NOT sanitize HTML content in string properties.
// Raw string values are passed through as-is, which could be a security concern
// if these values are rendered in a web interface without proper escaping.
