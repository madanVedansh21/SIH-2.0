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
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`ML API error ${res.status}: ${body}`);
      }
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
      // First attempt: JSON + base64 (current contract)
      const payload = {
        testId,
        filename: file.originalname || "upload",
        mimetype: file.mimetype || "application/octet-stream",
        contentBase64: file.buffer ? file.buffer.toString("base64") : null,
      };
      let res = await fetch(config.mlApiUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      // If server rejects JSON with validation (e.g., FastAPI 422/415/400), retry as multipart/form-data
      if (!res.ok && [400, 415, 422].includes(res.status)) {
        try {
          const FormData = require("form-data");
          const form = new FormData();
          // Common FastAPI pattern: field name 'file'
          form.append("file", file.buffer, {
            filename: file.originalname || "upload.csv",
            contentType: file.mimetype || "text/csv",
          });
          // Provide both naming styles for server-side convenience
          form.append("testId", String(testId));
          form.append("test_id", String(testId));
          if (file.originalname) form.append("filename", file.originalname);
          if (file.mimetype) form.append("mimetype", file.mimetype);

          res = await fetch(config.mlApiUrl, {
            method: "POST",
            body: form,
            headers: form.getHeaders(),
          });
        } catch (fallbackErr) {
          // If form-data isn't available or something else fails, surface original response
        }
      }

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`ML API error ${res.status}: ${body}`);
      }
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
