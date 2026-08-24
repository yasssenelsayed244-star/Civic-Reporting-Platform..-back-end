const env = require('./config/environment');
const app = require('./app');
const db = require('./models');

async function startServer() {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');

    // Sync database (creates tables if they don't exist)
    await db.sequelize.sync({ alter: false });
    console.log('✅ Database synced');

    // Start HTTP server
    const server = app.listen(env.port, () => {
      console.log(`\n🚀 Server running on http://localhost:${env.port}`);
      console.log(`📡 API: http://localhost:${env.port}/api/v1`);
      console.log(`🏥 Health: http://localhost:${env.port}/api/v1/health`);
      console.log(`🌍 Environment: ${env.nodeEnv}\n`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await db.sequelize.close();
        console.log('Database connection closed.');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcing shutdown.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);

    if (error.message.includes('ECONNREFUSED') || error.message.includes('authentication')) {
      console.error('\n💡 Make sure PostgreSQL is running and the credentials in .env are correct.');
      console.error('   Required: PostgreSQL with PostGIS extension enabled.');
      console.error('   Run: CREATE EXTENSION IF NOT EXISTS postgis;');
    }

    process.exit(1);
  }
}

startServer();
