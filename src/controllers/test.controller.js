const testService = require("../services/test.service");

async function listTests(req, res, next) {
  try {
    const { transformerId } = req.params;
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(transformerId)) {
      return res.status(400).json({ error: "Invalid transformer id" });
    }
    const list = await testService.listTests(transformerId);
    // Provide an `id` alias for `_id` to keep frontend usage consistent
    const mapped = list.map((t) => ({ ...t, id: t._id }));
    res.json(mapped);
  } catch (err) {
    next(err);
  }
}

async function getTest(req, res, next) {
  try {
    const { testId } = req.params;
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ error: "Invalid test id" });
    }
    const data = await testService.getTestDetails(testId);
    if (!data.test) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function approveTest(req, res, next) {
  try {
    // only asset-managers may approve
    if (!req.user || req.user.role !== "asset-manager")
      return res.status(403).json({ error: "Forbidden" });
    const updated = await testService.setApproval(
      req.params.testId,
      true,
      req.user._id,
      req.body.comment
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function unapproveTest(req, res, next) {
  try {
    if (!req.user || req.user.role !== "asset-manager")
      return res.status(403).json({ error: "Forbidden" });
    const updated = await testService.setApproval(
      req.params.testId,
      false,
      null,
      req.body.reason
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { listTests, getTest, approveTest, unapproveTest };
