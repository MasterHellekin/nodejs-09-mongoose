"use strict";var deleteProduct=function(e){var t=e.parentNode.querySelector("[name=productId]").value,o=e.parentNode.querySelector("[name=_csrf]").value,n=e.closest("article");fetch("/admin/product/"+t,{method:"DELETE",headers:{"csrf-token":o}}).then(function(e){return e.json()}).then(function(e){console.log(e),n.parentNode.removeChild(n)}).catch(function(e){return console.log(e)})};