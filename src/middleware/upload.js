const multer = require("multer");
const path = require("path");
const config = require("../config");

// Use memory storage so uploaded files are not persisted to disk
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  // Allow all file types. Be cautious: validating MIME type or scanning files is recommended in production.
  cb(null, true);
}

const limits = { fileSize: 10 * 1024 * 1024 }; // 10MB

const upload = multer({ storage, fileFilter, limits });

module.exports = { upload };
