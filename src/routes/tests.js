const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/test.controller');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/transformer/:transformerId', ctrl.listTests);
router.get('/:testId', ctrl.getTest);

module.exports = router;
