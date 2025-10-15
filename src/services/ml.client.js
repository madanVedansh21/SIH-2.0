const config = require("../config");
const fetch = require("node-fetch");

async function send(parsedData, testId) {
  // Placeholder: if ML API is configured, send data. Otherwise return mock inference.
  if (config.mlApiUrl) {
    try {
      const res = await fetch(config.mlApiUrl, {
        method: "POST",
        body: JSON.stringify({ testId, data: parsedData }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("ML API error");
      const json = await res.json();
      // Attach testId so callers can always link responses to the Test
      return Object.assign({ testId }, json);
    } catch (err) {
      throw err;
    }
  }

  // mock inference
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        testId,
        requestId: `mock-${Date.now()}`,
        // summary kept for backward compatibility in UI
        summary: { classification: "normal", score: 0.02 },
        // New rich result aligned with AI output contract
        result: {
          diagnosis: {
            anomaly_detected: false,
            anomaly_probability: 0.02,
            primary_fault: {
              type: "healthy",
              confidence: 0.98,
              description: "No major issues detected",
              reliability: "high",
            },
            fault_candidates: [
              { type: "healthy", probability: 0.98 },
              { type: "electrical_fault", probability: 0.01 },
              { type: "partial_discharge", probability: 0.01 },
            ],
            severity: { score: 0.05, level: "low" },
            criticality: { score: 0.05, level: "low" },
            analysis_timestamp: new Date().toISOString(),
          },
          recommendations: {
            immediate_actions: [],
            maintenance_actions: [
              "Routine inspection",
              "Check oil levels and temperature logs",
            ],
            monitoring_recommendations: [],
            priority: "low",
            timeframe: "next_maintenance_cycle",
          },
        },
        alerts: [],
      });
    }, 1000);
  });
}

// Send raw file buffer directly to ML API (no intermediate storage)
async function sendFile(file, testId) {
  // file: { buffer: Buffer, originalname?: string, mimetype?: string }
  if (config.mlApiUrl) {
    try {
      const payload = {
        testId,
        filename: file.originalname || "upload",
        mimetype: file.mimetype || "application/octet-stream",
        contentBase64: file.buffer ? file.buffer.toString("base64") : null,
      };
      const res = await fetch(config.mlApiUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("ML API error");
      const json = await res.json();
      return Object.assign({ testId }, json);
    } catch (err) {
      throw err;
    }
  }

  // mock inference path for local/dev
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        testId,
        requestId: `mock-file-${Date.now()}`,
        summary: { classification: "normal", score: 0.01 },
        result: {
          diagnosis: {
            anomaly_detected: false,
            anomaly_probability: 0.01,
            primary_fault: {
              type: "healthy",
              confidence: 0.99,
              description: "No major issues detected",
              reliability: "high",
            },
            fault_candidates: [
              { type: "healthy", probability: 0.99 },
              { type: "electrical_fault", probability: 0.005 },
              { type: "partial_discharge", probability: 0.005 },
            ],
            severity: { score: 0.02, level: "low" },
            criticality: { score: 0.02, level: "low" },
            analysis_timestamp: new Date().toISOString(),
          },
          recommendations: {
            immediate_actions: [],
            maintenance_actions: ["Routine inspection"],
            monitoring_recommendations: [],
            priority: "low",
            timeframe: "next_maintenance_cycle",
          },
        },
        alerts: [],
      });
    }, 800);
  });
}

module.exports = { send, sendFile };
