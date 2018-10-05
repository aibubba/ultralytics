const crypto = require('crypto');
const db = require('../db');

/**
 * Validate API key from request header
 * API key should be sent in the X-API-Key header
 */
async function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key is required',
      message: 'Please provide an API key in the X-API-Key header'
    });
  }

  try {
    // Hash the provided key to compare with stored hash
    const keyHash = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');

    const result = await db.query(
      'SELECT id, name FROM api_keys WHERE key_hash = $1 AND is_active = TRUE',
      [keyHash]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        error: 'Invalid API key',
        message: 'The provided API key is invalid or has been revoked'
      });
    }

    // Update last used timestamp
    await db.query(
      'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
      [result.rows[0].id]
    );

    // Attach key info to request for potential use in handlers
    req.apiKey = {
      id: result.rows[0].id,
      name: result.rows[0].name
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Failed to validate API key'
    });
  }
}

module.exports = {
  validateApiKey
};
