const Alert = require('../models/alert.model');

async function getUserAlerts(userId){
  return Alert.find({ user: userId }).sort({ createdAt: -1 }).lean();
}

module.exports = { getUserAlerts };
