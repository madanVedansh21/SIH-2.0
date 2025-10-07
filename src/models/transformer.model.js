const mongoose = require('mongoose');

const TransformerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  location: { type: String, trim: true },
  capacityMVA: { type: Number },
  installationDate: { type: Date },
  metadata: { type: Object, default: {} },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transformer', TransformerSchema);
