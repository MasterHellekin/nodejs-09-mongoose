"use strict";

var express = require('express');

var _require = require('express-validator/check'),
    check = _require.check,
    body = _require.body;

var authController = require('../controllers/auth');

var User = require('../models/user');

var router = express.Router();
router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.post('/login', [body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(), body('password', 'Password has to be valid').isLength({
  min: 5
}).isAlphanumeric().trim()], authController.postLogin);
router.post('/signup', [check('email').isEmail().withMessage('Please enter a valid email').custom(function (value, _ref) {
  var req = _ref.req;
  // if (value === 'test@test.com') {
  //     throw new Error('This email address is forbidden');
  // }
  // return true;
  return User.findOne({
    email: value
  }).then(function (userDoc) {
    if (userDoc) {
      return Promise.reject('E-mail exist already, please pick a different one');
    }
  });
}).normalizeEmail(), body('password', 'Please enter a password with only numbers and text and a least 5 characters').isLength({
  min: 4
}).isAlphanumeric().trim(), body('confirmPassword').trim().custom(function (value, _ref2) {
  var req = _ref2.req;

  if (value !== req.body.password) {
    throw new Error('Passwords have to match!');
  }

  return true;
})], authController.postSignup);
router.post('/logout', authController.postLogout);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);
module.exports = router;