const config = require('config');
const jwt = require('jsonwebtoken');
const _ = require('lodash'); // underscore is clean & pretty convention...
const { logger } = require('../util');
const { User } = require('../models/user');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const Joi = require('joi');
const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

/* jshint ignore:start */
// Login Process, Authentication
router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  // email 중복체크 코드 
  let user = await User.findOne({ email: req.body.email });
  // FIXME: 보안상의 이슈가 있을 수 있으므로 정책을 수정할 것.
  if(!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if(!validPassword) return res.status(400).send('Invalid email or password.');
  
  // 아래와 같이 코딩하는 것이 자연스럽다.
  const token = user.generateAuthToken();
  // const token = jwt.sign({ _id: user._id }, config.get('jwtPrivateKey'));

  res.send(token);
});

/** jshint ignore:end */

function validate(req){
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  }

  return Joi.validate(req, schema);
}

module.exports = router;