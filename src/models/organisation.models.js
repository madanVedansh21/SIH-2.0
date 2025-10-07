const mongoose = require("mongoose");

const OrganisationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  totalTransformers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transformer",
      index: true,
    },
  ],
  totalRedFlags: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalMissingReports: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalFieldEngineers: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAssetManagers: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
OrganisationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Organisation", OrganisationSchema);
