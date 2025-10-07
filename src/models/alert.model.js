const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  transformer: { type: mongoose.Schema.Types.ObjectId, ref: 'Transformer', index: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', index: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['low','medium','high','critical'], default: 'low', index: true },
  meta: { type: Object, default: {} },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);
