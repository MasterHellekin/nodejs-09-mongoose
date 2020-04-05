"use strict";

var crypto = require('crypto');

var bcrypt = require('bcryptjs');

var sgMail = require('@sendgrid/mail');

var _require = require('express-validator/check'),
    validationResult = _require.validationResult;

var User = require('../models/user');

sgMail.setApiKey('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');

exports.getLogin = function (req, res, next) {
  var message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = function (req, res, next) {
  var message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    });
  }

  User.findOne({
    email: email
  }).then(function (user) {
    if (!user) {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false,
        errorMessage: 'Invalid email or password',
        oldInput: {
          email: email,
          password: password
        },
        validationErrors: []
      });
    }

    bcrypt.compare(password, user.password).then(function (doMatch) {
      if (doMatch) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save(function (err) {
          console.log(err);
          res.redirect('/');
        });
      }

      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false,
        errorMessage: 'Invalid email or password',
        oldInput: {
          email: email,
          password: password
        },
        validationErrors: []
      });
    })["catch"](function (err) {
      console.log(err);
      res.redirect('/login');
    });
  })["catch"](function (err) {
    var error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postSignup = function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array()
    });
  }

  bcrypt.hash(password, 12).then(function (hashedPassword) {
    var user = new User({
      email: email,
      password: hashedPassword,
      cart: {
        item: []
      }
    });
    return user.save();
  }).then(function (result) {
    res.redirect('/login');
    return sgMail.send({
      from: 'clsjs1994@gmail.com',
      to: email,
      subject: 'Signup succeeded',
      html: '<h1>You successfully signed up!</h1>'
    });
  })["catch"](function (err) {
    var error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postLogout = function (req, res, next) {
  req.session.destroy(function (err) {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = function (req, res, next) {
  var message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = function (req, res, next) {
  crypto.randomBytes(32, function (err, buffer) {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }

    var token = buffer.toString('hex');
    User.findOne({
      email: req.body.email
    }).then(function (user) {
      if (!user) {
        req.flash('error', 'No account with that email found');
        return res.redirect('/reset');
      }

      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    }).then(function (result) {
      res.redirect('/');
      sgMail.send({
        from: 'clsjs1994@gmail.com',
        to: req.body.email,
        subject: 'Password reset',
        html: "\n          <p>You requested a password reset</p>\n          <p>Click this <a href=\"http://localhost:3000/reset/".concat(token, "\">link</a> to set a new password</p>\n          ")
      });
    })["catch"](function (err) {
      var error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  });
};

exports.getNewPassword = function (req, res, next) {
  var token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: {
      $gt: Date.now()
    }
  }).then(function (user) {
    var message = req.flash('error');

    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token
    });
  })["catch"](function (err) {
    var error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postNewPassword = function (req, res, next) {
  var newPassword = req.body.password;
  var userId = req.body.userId;
  var passwordToken = req.body.passwordToken;
  var resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: {
      $gt: Date.now()
    },
    _id: userId
  }).then(function (user) {
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  }).then(function (hashedPassword) {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  }).then(function (result) {
    res.redirect('/login');
  })["catch"](function (err) {
    var error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};