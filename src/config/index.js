require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  dbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/transformer_db',
  jwtSecret: process.env.JWT_SECRET || 'fbd8cd956b56b4a1b67e6989843909f824c73ce9ece7dcc11e06a96cda724ee4963f2b36fc2f25b4ca47a4a341019333392b4a9a6a27465ab9f2b3fa002fc98e',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mlApiUrl: process.env.ML_API_URL || null,
  uploadDir: process.env.UPLOAD_DIR || 'uploads'
};
