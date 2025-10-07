const alertService = require('../services/alert.service');

async function getAlerts(req, res, next){
  try{
    const list = await alertService.getUserAlerts(req.user._id);
    res.json(list);
  }catch(err){ next(err); }
}

module.exports = { getAlerts };
