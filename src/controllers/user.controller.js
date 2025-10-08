const User = require('../models/user.models');

async function listUsers(req, res, next){
  try{
    const q = {};
    if(req.query.organisation) q.organisation = req.query.organisation;
    const users = await User.find(q).select('-password').lean();
    res.json(users);
  }catch(err){ next(err); }
}

async function getUser(req, res, next){
  try{
    const user = await User.findById(req.params.id).select('-password').lean();
    if(!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  }catch(err){ next(err); }
}

async function updateUser(req, res, next){
  try{
    const update = Object.assign({}, req.body);
    if(update.password) delete update.password; // handle password change elsewhere
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    res.json(user);
  }catch(err){ next(err); }
}

async function deleteUser(req, res, next){
  try{
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }catch(err){ next(err); }
}

async function getMe(req, res, next){
  try{
    const user = await User.findById(req.user._id).select('-password').lean();
    res.json(user);
  }catch(err){ next(err); }
}

module.exports = { listUsers, getUser, updateUser, deleteUser, getMe };
