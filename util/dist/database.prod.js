"use strict";var _db,mongodb=require("mongodb"),MongoClient=mongodb.MongoClient,mongoConnect=function(n){MongoClient.connect("mongodb+srv://Carl:Okami1928@cluster0-hvut0.mongodb.net/shop?retryWrites=true&w=majority").then(function(o){console.log("Connected!"),_db=o.db(),n(o)}).catch(function(o){throw console.log(o),o})},getDb=function(){if(_db)return _db;throw"No database found!"};exports.mongoConnect=mongoConnect,exports.getDb=getDb;