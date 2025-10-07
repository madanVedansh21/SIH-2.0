const config = require('../config');
const fetch = require('node-fetch');

async function send(parsedData, testId){
  // Placeholder: if ML API is configured, send data. Otherwise return mock inference.
  if(config.mlApiUrl){
    try{
      const res = await fetch(config.mlApiUrl, { method: 'POST', body: JSON.stringify({ testId, data: parsedData }), headers: { 'Content-Type': 'application/json' } });
      if(!res.ok) throw new Error('ML API error');
      return res.json();
    }catch(err){
      throw err;
    }
  }

  // mock inference
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        summary: { classification: 'normal', score: 0.02 },
        alerts: []
      });
    }, 1000);
  });
}

module.exports = { send };
