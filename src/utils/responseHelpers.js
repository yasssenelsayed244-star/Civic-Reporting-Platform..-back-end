/**
 * Standardized API response helpers.
 * Every API response goes through these to ensure consistent format.
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {*}      [options.data]    - Response payload
 * @param {string} [options.message] - Human-readable message
 * @param {number} [options.statusCode=200] - HTTP status code
 */
function sendSuccess(res, { data = null, message = 'Operation completed successfully', statusCode = 200 } = {}) {
  const response = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {string} [options.message] - Human-readable error message
 * @param {number} [options.statusCode=500] - HTTP status code
 * @param {Array}  [options.errors]  - Optional field-level errors
 */
function sendError(res, { message = 'An error occurred', statusCode = 500, errors = null } = {}) {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

module.exports = { sendSuccess, sendError };
