const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config')

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  lastname: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  department: {
    type: String,
    // required: true,
    minlength: 0,
    maxlength: 1024
  },
  isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin, department: this.department }, process.env.jwtPrivateKey);
  return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    firstname: Joi.string().min(5).max(50).required(),
    lastname: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    department: Joi.string().min(0).max(255).required(),
  };

  return Joi.validate(user, schema)
}

exports.User = User;
exports.validateUser = validateUser;