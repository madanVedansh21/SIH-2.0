const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
  transformer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transformer",
    required: true,
    index: true,
  },
  filename: { type: String },
  originalName: { type: String },
  uploadPath: { type: String },
  fileType: { type: String },
  testDate: { type: Date, required: true, index: true },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  // Approval fields: whether the test result has been approved by an authorised user
  approved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: { type: Date },
  analysisSummary: { type: Object, default: {} },
  rawData: { type: Object, default: {} },
  // Full structured AI result (diagnosis, recommendations, etc.)
  aiResult: { type: Object, default: {} },
  mlRequestId: { type: String },
  mlResponse: { type: Object, default: {} },
  processedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Test", TestSchema);
