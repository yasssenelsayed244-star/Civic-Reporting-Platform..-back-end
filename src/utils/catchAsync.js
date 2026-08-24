/**
 * Wraps an async route handler so that rejected promises are
 * forwarded to Express's next(err) automatically.
 *
 * Usage:
 *   router.get('/foo', catchAsync(async (req, res) => { ... }));
 *
 * @param {Function} fn - Async Express handler (req, res, next)
 * @returns {Function}
 */
function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = catchAsync;
