const testService = require('../services/test.service');

async function listTests(req, res, next){
  try{
    const list = await testService.listTests(req.params.transformerId);
    res.json(list);
  }catch(err){ next(err); }
}

async function getTest(req, res, next){
  try{
    const data = await testService.getTestDetails(req.params.testId);
    if(!data.test) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  }catch(err){ next(err); }
}

module.exports = { listTests, getTest };
