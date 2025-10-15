const express = require("express");
const router = express.Router();
const LiveData = require("../models/liveData.model");

// POST /api/live-data
router.post("/", async (req, res) => {
  try {
    const liveData = new LiveData(req.body);
    await liveData.save();
    res
      .status(201)
      .json({ message: "Live data saved successfully", data: liveData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /live-data
// Fetch all live data entries (can be polled constantly by frontend)
router.get("/", async (req, res) => {
  try {
    const data = await LiveData.find().sort({ createdAt: -1 });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
