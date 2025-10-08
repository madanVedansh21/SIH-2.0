const Test = require('../models/test.model');
const Transformer = require('../models/transformer.model');
const Alert = require('../models/alert.model');
const mlClient = require('./ml.client');

async function createTestRecord({ transformerId, fileRecord, parsedData, testDate, uploaderId }){
  const test = new Test({
    transformer: transformerId,
    filename: fileRecord.filename,
    originalName: fileRecord.originalname,
    // Note: files are not stored on disk in memory mode; no uploadPath
    uploadPath: null,
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
      test.mlRequestId = inference.requestId || null;
      test.mlResponse = inference || {};
      test.processedAt = new Date();
      await test.save();

      // create alerts if any
      if(inference.alerts && inference.alerts.length){
        const alerts = inference.alerts.map(a => ({
          user: a.user || uploaderId || null,
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
      test.mlResponse = { error: err.message };
      test.processedAt = new Date();
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
