"use strict";

var deleteProduct = function deleteProduct(btn) {
  var productId = btn.parentNode.querySelector('[name=productId]').value;
  var csrf = btn.parentNode.querySelector('[name=_csrf]').value;
  var productElement = btn.closest('article');
  fetch('/admin/product/' + productId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  }).then(function (result) {
    return result.json();
  }).then(function (data) {
    console.log(data);
    productElement.parentNode.removeChild(productElement);
  })["catch"](function (err) {
    return console.log(err);
  });
};