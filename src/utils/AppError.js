/**
 * Custom application error class.
 * Extends Error with an HTTP status code and operational flag.
 * 
 * Operational errors (isOperational = true) are expected errors like
 * validation failures, not-found, etc. — safe to send to the client.
 * 
 * Programming errors (isOperational = false) are bugs — logged and
 * responded with a generic 500 message.
 */
class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Array} [errors] - Optional array of field-level errors
   */
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', errors = null) {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = 'Authentication required') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Access denied') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  static conflict(message = 'Resource already exists') {
    return new AppError(message, 409);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new AppError(message, 429);
  }

  static internal(message = 'Internal server error') {
    const error = new AppError(message, 500);
    error.isOperational = false;
    return error;
  }
}

module.exports = AppError;
