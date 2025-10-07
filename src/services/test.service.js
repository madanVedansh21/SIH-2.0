const Test = require('../models/test.model');
const Transformer = require('../models/transformer.model');
const Alert = require('../models/alert.model');
const mlClient = require('./ml.client');

async function createTestRecord({ transformerId, fileRecord, parsedData, testDate }){
  const test = new Test({
    transformer: transformerId,
    filename: fileRecord.filename,
    originalName: fileRecord.originalname,
    uploadPath: fileRecord.path || fileRecord.uploadPath,
    fileType: fileRecord.mimetype || fileRecord.type,
    testDate: testDate || new Date(),
    rawData: parsedData,
    status: 'processing'
  });
  await test.save();

  // send to ML model asynchronously
  mlClient.send(parsedData, test._id)
    .then(async (inference) => {
      test.analysisSummary = inference.summary || {};
      test.status = 'completed';
      await test.save();

      // create alerts if any
      if(inference.alerts && inference.alerts.length){
        const alerts = inference.alerts.map(a => ({
          user: a.user || null,
          transformer: transformerId,
          test: test._id,
          message: a.message,
          severity: a.severity || 'low',
          meta: a.meta || {}
        }));
        await Alert.insertMany(alerts);
      }
    })
    .catch(async (err) => {
      test.status = 'failed';
      test.analysisSummary = { error: err.message };
      await test.save();
    });

  return test;
}

async function listTests(transformerId){
  return Test.find({ transformer: transformerId }).sort({ testDate: -1 }).lean();
}

async function getTestDetails(testId){
  const test = await Test.findById(testId).lean();
  // prepare graph data (placeholder)
  const graphData = { points: test.rawData?.points || [], meta: test.analysisSummary || {} };
  return { test, graphData };
}

module.exports = { createTestRecord, listTests, getTestDetails };
