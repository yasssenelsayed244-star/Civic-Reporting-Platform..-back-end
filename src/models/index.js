'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const env = require('../config/environment');

let sequelize;

if (env.isProduction && env.db.url) {
  sequelize = new Sequelize(env.db.url, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  });
} else {
  sequelize = new Sequelize(env.db.name, env.db.username, env.db.password, {
    host: env.db.host,
    port: env.db.port,
    dialect: 'postgres',
    logging: false,
  });
}

const db = {};
const basename = path.basename(__filename);

// Auto-load all model files in this directory
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      !file.includes('.test.')
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

// Run associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
