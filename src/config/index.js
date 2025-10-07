require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  dbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/transformer_db',
  jwtSecret: process.env.JWT_SECRET || 'change_this',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mlApiUrl: process.env.ML_API_URL || null,
  uploadDir: process.env.UPLOAD_DIR || 'uploads'
};
