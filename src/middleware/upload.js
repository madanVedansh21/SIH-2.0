const multer = require('multer');
const path = require('path');
const config = require('../config');

// Use memory storage so uploaded files are not persisted to disk
const storage = multer.memoryStorage();

function fileFilter(req, file, cb){
  const allowed = ['.csv','.json','.xml'];
  const ext = path.extname(file.originalname).toLowerCase();
  if(allowed.includes(ext)) cb(null, true);
  else cb(new Error('Unsupported file type'), false);
}

const limits = { fileSize: 10 * 1024 * 1024 }; // 10MB

const upload = multer({ storage, fileFilter, limits });

module.exports = { upload };
