const transformerService = require('../services/transformer.service');
const testService = require('../services/test.service');

async function createTransformer(req, res, next){
  try{
    const payload = Object.assign({}, req.body, { owner: req.user._id });
    const t = await transformerService.createTransformer(payload);
    res.status(201).json(t);
  }catch(err){ next(err); }
}

async function listTransformers(req, res, next){
  try{
    // Return organisation's transformers as the authoritative list
    const orgId = req.user.organisation;
    const list = await transformerService.getOrganisationTransformers(orgId);
    // attach pending alerts count and assignedToUser flag
    const transformersWithCounts = await Promise.all(list.map(async (t) => {
      const pending = await require('../models/alert.model').countDocuments({ transformer: t._id, read: false });
      const assignedToUser = t.owner && t.owner._id && t.owner._id.toString() === req.user._id.toString();
      return Object.assign({}, { id: t._id, name: t.name, installationDate: t.installationDate, metadata: t.metadata || {}, owner: t.owner || null, createdAt: t.createdAt, pendingAlerts: pending, assignedToUser });
    }));
    res.json(transformersWithCounts);
  }catch(err){ next(err); }
}

async function getTransformer(req, res, next){
  try{
    const t = await transformerService.getTransformerById(req.params.id);
    if(!t) return res.status(404).json({ error: 'Not found' });
    res.json(t);
  }catch(err){ next(err); }
}

async function updateTransformer(req, res, next){
  try{
    const t = await transformerService.updateTransformer(req.params.id, req.body);
    res.json(t);
  }catch(err){ next(err); }
}

async function deleteTransformer(req, res, next){
  try{
    await transformerService.deleteTransformer(req.params.id);
    res.json({ ok: true });
  }catch(err){ next(err); }
}

async function uploadTestFile(req, res, next){
  try{
    if(!req.file) return res.status(400).json({ error: 'File required' });
    // parse file
    const parser = require('../utils/parseFile');
    const parsed = await parser.parseFile(req.file.path);
    const test = await testService.createTestRecord({ transformerId: req.params.transformerId, fileRecord: req.file, parsedData: parsed, testDate: parsed.testDate || new Date() });
    res.status(201).json(test);
  }catch(err){ next(err); }
}

module.exports = { createTransformer, listTransformers, getTransformer, updateTransformer, deleteTransformer, uploadTestFile };
