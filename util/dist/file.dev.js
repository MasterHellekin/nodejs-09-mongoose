"use strict";

var fs = require('fs');

var deleteFile = function deleteFile(filePath) {
  fs.unlink(filePath, function (err) {
    if (err) {
      throw err;
    }
  });
};

exports.deleteFile = deleteFile;