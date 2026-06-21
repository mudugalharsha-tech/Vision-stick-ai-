require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');

const { connectDB } = require('./config/db');
const { globalRateLimiter } = require('./middleware/rateLimiter');
const logger = require('./config/logger');

const sessionRoutes   = require('./routes/sessions');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// ── Security middleware ────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(compression());
app.use(mongoSanitize());
app.use(globalRateLimiter);

// ── Body parsing ───────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Request logging ────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: msg => logger.info(msg.trim()) }
  }));
}

// ── Health check ───────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'VisionStick AI API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ─────────────────────────────────────────────
app.use('/api/sessions',  sessionRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── 404 handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ───────────────────────────────────
app.use((err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  logger.error(`${status} — ${err.message} — ${req.originalUrl}`);
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`VisionStick API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
}
start();

module.exports = app; // for tests
