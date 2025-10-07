const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const uploadDir = config.uploadDir || 'uploads';
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, uploadDir);
  },
  filename: function(req, file, cb){
    const unique = Date.now() + '-' + Math.round(Math.random()*1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

function fileFilter(req, file, cb){
  const allowed = ['.csv','.json','.xml'];
  const ext = path.extname(file.originalname).toLowerCase();
  if(allowed.includes(ext)) cb(null, true);
  else cb(new Error('Unsupported file type'), false);
}

const limits = { fileSize: 10 * 1024 * 1024 }; // 10MB

const upload = multer({ storage, fileFilter, limits });

module.exports = { upload };
