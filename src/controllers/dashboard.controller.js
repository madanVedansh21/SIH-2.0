const transformerService = require('../services/transformer.service');
const Alert = require('../models/alert.model');

async function getDashboard(req, res, next){
  try{
    const transformers = await transformerService.getUserTransformers(req.user._id);
    const data = await Promise.all(transformers.map(async (t) => {
      const pending = await Alert.countDocuments({ transformer: t._id, read: false });
      return { ...t, pendingAlerts: pending };
    }));
    res.json({ transformers: data });
  }catch(err){ next(err); }
}

module.exports = { getDashboard };
