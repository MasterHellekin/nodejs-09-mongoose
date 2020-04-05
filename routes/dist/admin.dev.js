"use strict";

var express = require('express');

var _require = require('express-validator/check'),
    body = _require.body;

var adminController = require('../controllers/admin');

var isAuth = require('../middleware/is-auth');

var router = express.Router();
router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', isAuth, adminController.getProducts);
router.post('/add-product', [body('title').isString().isLength({
  min: 3
}).trim(), body('price').isFloat(), body('description').isLength({
  min: 5,
  max: 400
}).trim()], isAuth, adminController.postAddProduct);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/edit-product', [body('title').isAlphanumeric().isLength({
  min: 3
}).trim(), body('price').isFloat(), body('description').isLength({
  min: 5,
  max: 400
}).trim()], isAuth, adminController.postEditProduct);
router["delete"]('/product/:productId', isAuth, adminController.deleteProduct);
module.exports = router;