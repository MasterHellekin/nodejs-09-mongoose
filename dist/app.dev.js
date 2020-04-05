"use strict";

var path = require('path');

var fs = require('fs');

var https = require('https');

var express = require('express');

var bodyParser = require('body-parser');

var mongoose = require('mongoose');

var session = require('express-session');

var MongoDBStore = require('connect-mongodb-session')(session);

var csrf = require('csurf');

var flash = require('connect-flash');

var multer = require('multer');

var uuidv4 = require('uuid/v4');

var helmet = require('helmet');

var compression = require('compression');

var morgan = require('morgan');

var errorController = require('./controllers/error');

var User = require('./models/user');

console.log(process.env.NODE_ENV);
var MONGODB_URI = "mongodb+srv://".concat(process.env.MONGO_USER, ":").concat(process.env.MONGO_PASSWORD, "@cluster0-hvut0.mongodb.net/").concat(process.env.MONGO_DEFAULT_DATABASE);
var app = express();
var store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
var csrfProtection = csrf(); // const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

var fileStorage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, 'images');
  },
  filename: function filename(req, file, cb) {
    cb(null, uuidv4() + '-' + file.originalname);
  }
});

var fileFilter = function fileFilter(req, file, cb) {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

var adminRoutes = require('./routes/admin');

var shopRoutes = require('./routes/shop');

var authRoutes = require('./routes/auth');

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a'
});
app.use(helmet());
app.use(compression());
app.use(morgan('combined', {
  stream: accessLogStream
}));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(multer({
  storage: fileStorage,
  fileFilter: fileFilter
}).single('image'));
app.use(express["static"](path.join(__dirname, 'public')));
app.use('/images', express["static"](path.join(__dirname, 'images')));
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}));
app.use(csrfProtection);
app.use(flash());
app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use(function (req, res, next) {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id).then(function (user) {
    if (!user) {
      return next();
    }

    req.user = user;
    next();
  })["catch"](function (err) {
    next(new Error(err));
  });
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', errorController.get500);
app.use(errorController.get404);
app.use(function (error, req, res, next) {
  console.log(error);
  res.redirect('/500');
});
mongoose.connect(MONGODB_URI).then(function (result) {
  // https.createServer({ key: privateKey, cert: certificate }, app).listen(process.env.PORT || 3000);
  app.listen(process.env.PORT || 3000);
})["catch"](function (err) {
  console.log(err);
});