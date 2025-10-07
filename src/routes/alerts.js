const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/alert.controller');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', ctrl.getAlerts);

module.exports = router;
