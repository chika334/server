const { User, validateUser } = require('../models/Users');
// const mongoose = require('mongoose');
const express = require('express')
const app = express();
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

router.get('/auth', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
})

// saving users details to the database or registering users
router.post('/', async (req, res) => {
  // checks for error while connecting route
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ msg: 'Please enter all fields' });

  // verifies if user already exit
  let user = await User.findOne({ email: req.body.email })
  if (user) return res.status(400).json({ msg: 'User already registered' })

  // gets new users info
  user = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    department: req.body.department,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt)

  // saves the details to the database
  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send({ user, token });
})

module.exports = router; 