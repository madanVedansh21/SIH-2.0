const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  transformer: { type: mongoose.Schema.Types.ObjectId, ref: 'Transformer', required: true, index: true },
  filename: { type: String },
  originalName: { type: String },
  uploadPath: { type: String },
  fileType: { type: String },
  testDate: { type: Date, required: true, index: true },
  status: { type: String, enum: ['pending','processing','completed','failed'], default: 'pending' },
  analysisSummary: { type: Object, default: {} },
  rawData: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Test', TestSchema);
