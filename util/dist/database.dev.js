"use strict";

var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

var _db;

var mongoConnect = function mongoConnect(callback) {
  MongoClient.connect('mongodb+srv://Carl:Okami1928@cluster0-hvut0.mongodb.net/shop?retryWrites=true&w=majority').then(function (client) {
    console.log('Connected!');
    _db = client.db();
    callback(client);
  })["catch"](function (err) {
    console.log(err);
    throw err;
  });
};

var getDb = function getDb() {
  if (_db) {
    return _db;
  }

  throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;