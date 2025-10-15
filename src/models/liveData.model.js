const mongoose = require("mongoose");

const TopFaultCandidateSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    confidence: { type: Number, required: true },
  },
  { _id: false }
);

const PredictionSchema = new mongoose.Schema(
  {
    anomaly_detected: { type: Boolean, required: true },
    anomaly_probability: { type: Number, required: true },
    fault_type: { type: String, required: true },
    fault_confidence: { type: Number, required: true },
    fault_reliability: { type: String, required: true },
    top_fault_candidates: {
      type: [[mongoose.Schema.Types.Mixed]],
      required: true,
    },
    severity: { type: Number, required: true },
    severity_level: { type: String, required: true },
    criticality: { type: Number, required: true },
    criticality_level: { type: String, required: true },
    timestamp: { type: String, required: true },
    prediction_id: { type: String, required: true },
  },
  { _id: false }
);

const RecommendationSchema = new mongoose.Schema(
  {
    prediction_id: { type: String, required: true },
    actions: [{ type: String, required: true }],
    timeframe: { type: String, required: true },
    priority: { type: String, required: true },
  },
  { _id: false }
);

const SummarySchema = new mongoose.Schema(
  {
    n_samples: { type: Number, required: true },
    anomalies_detected: { type: Number, required: true },
    critical_faults: { type: Number, required: true },
    low_reliability_predictions: { type: Number, required: true },
  },
  { _id: false }
);

const LiveDataSchema = new mongoose.Schema(
  {
    processed_data_shape: [{ type: Number, required: true }],
    timestamp: { type: String, required: true },
    predictions: [PredictionSchema],
    recommendations: [RecommendationSchema],
    summary: SummarySchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("LiveData", LiveDataSchema);
