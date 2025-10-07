const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config');

async function signup({ name, email, password }){
  const existing = await User.findOne({ email });
  if(existing) throw new Error('Email already in use');
  const user = new User({ name, email, password });
  await user.save();
  return user;
}

async function login({ email, password }){
  const user = await User.findOne({ email });
  if(!user) throw new Error('Invalid credentials');
  const match = await user.comparePassword(password);
  if(!match) throw new Error('Invalid credentials');
  const token = jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  return { user, token };
}

module.exports = { signup, login };
