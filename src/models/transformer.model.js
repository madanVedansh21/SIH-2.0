const mongoose = require("mongoose");

const TransformerSchema = new mongoose.Schema({
  transformerId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  installationDate: {
    type: Date,
  },
  totalTests: {
    type: Number,
    default: 0,
    min: 0,
  },
  approvedTests: {
    type: Number,
    default: 0,
    min: 0,
  },
  dangerZoned: {
    type: Number,
    default: 0,
    min: 0,
  },
  allTests: [
    {
      testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      approvalFlag: {
        type: String,
        enum: ["approved", "pending"],
        default: "pending",
      },
      dangerFlag: {
        type: String,
        enum: ["danger", "normal"],
        default: "normal",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transformer", TransformerSchema);
