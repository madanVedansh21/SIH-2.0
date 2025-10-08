const Organisation = require('../models/organisation.models');

async function createOrganisation(req, res, next){
  try{
    const org = new Organisation(req.body);
    await org.save();
    res.status(201).json(org);
  }catch(err){ next(err); }
}

async function getOrganisation(req, res, next){
  try{
    const org = await Organisation.findById(req.params.id).lean();
    if(!org) return res.status(404).json({ error: 'Not found' });
    res.json(org);
  }catch(err){ next(err); }
}

async function updateOrganisation(req, res, next){
  try{
    const org = await Organisation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(org);
  }catch(err){ next(err); }
}

async function addTransformerToOrg(req, res, next){
  try{
    const { transformerId } = req.body;
    if(!transformerId) return res.status(400).json({ error: 'transformerId required' });
    const org = await Organisation.findByIdAndUpdate(req.params.id, { $addToSet: { totalTransformers: transformerId } }, { new: true });
    res.json(org);
  }catch(err){ next(err); }
}

async function removeTransformerFromOrg(req, res, next){
  try{
    const { transformerId } = req.body;
    if(!transformerId) return res.status(400).json({ error: 'transformerId required' });
    const org = await Organisation.findByIdAndUpdate(req.params.id, { $pull: { totalTransformers: transformerId } }, { new: true });
    res.json(org);
  }catch(err){ next(err); }
}

module.exports = { createOrganisation, getOrganisation, updateOrganisation, addTransformerToOrg, removeTransformerFromOrg };
