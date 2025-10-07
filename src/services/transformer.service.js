const Transformer = require('../models/transformer.model');
const Test = require('../models/test.model');
const Alert = require('../models/alert.model');

async function createTransformer(data){
  const t = new Transformer(data);
  return t.save();
}

async function getUserTransformers(userId){
  return Transformer.find({ owner: userId }).lean();
}

async function getTransformerById(id){
  return Transformer.findById(id);
}

async function updateTransformer(id, data){
  return Transformer.findByIdAndUpdate(id, data, { new: true });
}

async function deleteTransformer(id){
  await Test.deleteMany({ transformer: id });
  await Alert.deleteMany({ transformer: id });
  return Transformer.findByIdAndDelete(id);
}

module.exports = { createTransformer, getUserTransformers, getTransformerById, updateTransformer, deleteTransformer };
