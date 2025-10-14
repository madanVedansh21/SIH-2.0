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
      // expect ML API to optionally return a requestId
      return json;
    } catch (err) {
      throw err;
    }
  }

  // mock inference
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        requestId: `mock-${Date.now()}`,
        summary: { classification: "normal", score: 0.02 },
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
      return json;
    } catch (err) {
      throw err;
    }
  }

  // mock inference path for local/dev
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        requestId: `mock-file-${Date.now()}`,
        summary: { classification: "normal", score: 0.01 },
        alerts: [],
      });
    }, 800);
  });
}

module.exports = { send, sendFile };
