/**
 * Catch unhandled errors from async route handlers and unknown routes.
 */
const notFound = (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
  }
  return next();
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('[API Error]', err);

  const status = err.statusCode || err.status || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Server error';

  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
