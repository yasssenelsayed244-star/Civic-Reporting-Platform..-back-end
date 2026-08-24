const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/environment');
const { sendError } = require('./utils/responseHelpers');
const AppError = require('./utils/AppError');

const app = express();

// ─── Security Middleware ───────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsing ──────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (development only) ─────────────────
if (env.isDevelopment) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
  });
}

// ─── Health Check ──────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'Civic Reporting Platform API is running',
    data: {
      version: '1.0.0',
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── API Routes (will be added in Tier 1) ──────────────
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/reports', reportRoutes);
// app.use('/api/v1/categories', categoryRoutes);
// app.use('/api/v1/admin', adminRoutes);
// app.use('/api/v1/ai', aiRoutes);
// app.use('/api/v1/notifications', notificationRoutes);

// ─── 404 Handler ───────────────────────────────────────
app.use((req, res) => {
  sendError(res, {
    message: `Cannot ${req.method} ${req.originalUrl}`,
    statusCode: 404,
  });
});

// ─── Global Error Handler ──────────────────────────────
app.use((err, req, res, _next) => {
  // Zod validation errors
  if (err.name === 'ZodError') {
    return sendError(res, {
      message: 'Validation failed',
      statusCode: 400,
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return sendError(res, {
      message: 'Database validation failed',
      statusCode: 400,
      errors: err.errors?.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Known operational errors (AppError)
  if (err instanceof AppError && err.isOperational) {
    return sendError(res, {
      message: err.message,
      statusCode: err.statusCode,
      errors: err.errors,
    });
  }

  // Unknown / programming errors
  console.error('Unhandled error:', err);

  sendError(res, {
    message: env.isProduction
      ? 'An unexpected error occurred'
      : err.message || 'Internal server error',
    statusCode: 500,
  });
});

module.exports = app;
