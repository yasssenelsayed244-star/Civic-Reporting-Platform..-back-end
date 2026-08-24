require('dotenv').config();

/**
 * Centralized environment configuration.
 * All env vars are read here — no other file should read process.env directly
 * (except database.js which is used by sequelize-cli before app boots).
 */
const env = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Database
  db: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'civic_reporting_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    url: process.env.DATABASE_URL || null,
  },

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  // Anthropic AI
  ai: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
    temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.1,
    maxTokens: parseInt(process.env.AI_MAX_TOKENS, 10) || 1024,
  },

  // Versioning
  aiVersions: {
    systemPrompt: process.env.AI_SYSTEM_PROMPT_VERSION || '1.0.0',
    knowledge: process.env.AI_KNOWLEDGE_VERSION || '1.0.0',
    faq: process.env.AI_FAQ_VERSION || '1.0.0',
  },
};

env.isProduction = env.nodeEnv === 'production';
env.isDevelopment = env.nodeEnv === 'development';
env.isTest = env.nodeEnv === 'test';

module.exports = env;
