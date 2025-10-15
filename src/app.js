const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const config = require("./config");
const authRoutes = require("./routes/auth");
const transformerRoutes = require("./routes/transformers");
const testRoutes = require("./routes/tests");
const dashboardRoutes = require("./routes/dashboard");
const { errorHandler } = require("./middleware/error");
const fetch = require("node-fetch");

const liveDataRoutes = require("./routes/liveData");

const app = express();

app.use(cors());
app.use(express.json());

// Environment-based logging
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined")); // Production format
} else {
  app.use(morgan("dev"));
}

// Route registration
app.use("/auth", authRoutes);
app.use("/transformers", transformerRoutes);
app.use("/tests", testRoutes);
app.use("/dashboard", dashboardRoutes);

app.use("/live-data", liveDataRoutes);

mongoose
  .connect(config.dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error", err));

app.get("/", (req, res) =>
  res.json({ ok: true, message: "Transformer Diagnostics API" })
);

app.use(errorHandler);

// Background task to keep Hugging Face server alive
const PING_URL = "https://vedanshmadan21-transformer-build.hf.space/";
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

const keepAlive = async () => {
  try {
    const res = await fetch(PING_URL);
    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}`);
    }
    console.log(
      `✅ Hugging Face server kept alive at ${new Date().toISOString()}`
    );
  } catch (error) {
    console.error(`❌ Ping failed: ${error.message}`);
  }
};

setInterval(keepAlive, PING_INTERVAL);
// Initial ping on startup
keepAlive();

module.exports = app;
