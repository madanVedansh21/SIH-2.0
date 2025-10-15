const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/test.controller");
const { authMiddleware } = require("../middleware/auth");

router.use(authMiddleware);

router.get("/transformer/:transformerId", ctrl.listTests);
router.get("/:testId", ctrl.getTest);
router.post("/:testId/approve", ctrl.approveTest);
router.post("/:testId/unapprove", ctrl.unapproveTest);
router.delete("/:testId", ctrl.deleteTest);

module.exports = router;
