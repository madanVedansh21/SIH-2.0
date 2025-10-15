const testService = require("../services/test.service");

async function listTests(req, res, next) {
  try {
    const list = await testService.listTests(req.params.transformerId);
    res.json(list);
  } catch (err) {
    next(err);
  }
}

async function getTest(req, res, next) {
  try {
    const data = await testService.getTestDetails(req.params.testId);
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
