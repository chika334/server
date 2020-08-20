const { User } = require('../models/Users');
// const { User, validateUser } = require('../models/Users');
const mongoose = require('mongoose');
const express = require('express')
const router = express.Router();
// const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const Joi = require('joi');

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).json({ msg: 'Please fill all fields ' });

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ msg: 'Invalid Email or Password.' });

  const validPAssword = await bcrypt.compare(req.body.password, user.password);
  if (!validPAssword) return res.status(400).json({ msg: 'Invalid Email or Password.' });

  const token = user.generateAuthToken();
  res.send({ user, token })
})

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  }

  return Joi.validate(req, schema)
}

module.exports = router; 
