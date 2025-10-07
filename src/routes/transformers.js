const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/transformer.controller');
const { authMiddleware } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(authMiddleware);

router.post('/', ctrl.createTransformer);
router.get('/', ctrl.listTransformers);
router.get('/:id', ctrl.getTransformer);
router.put('/:id', ctrl.updateTransformer);
router.delete('/:id', ctrl.deleteTransformer);

router.post('/:transformerId/upload-test', upload.single('file'), ctrl.uploadTestFile);

module.exports = router;
