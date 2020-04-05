"use strict";function ownKeys(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)}return r}function _objectSpread(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?ownKeys(r,!0).forEach(function(t){_defineProperty(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):ownKeys(r).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function _defineProperty(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}var fs=require("fs"),path=require("path"),stripe=require("stripe")(process.env.STRIPE_KEY),PDFDocument=require("pdfkit"),Product=require("../models/product"),Order=require("../models/order"),ITEMS_PER_PAGE=1;exports.getProducts=function(t,e,r){var n,o=+t.query.page||1;Product.find().countDocuments().then(function(t){return n=t,Product.find().skip((o-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)}).then(function(t){e.render("shop/product-list",{prods:t,pageTitle:"Products",path:"/products",currentPage:o,hasNextPage:ITEMS_PER_PAGE*o<n,hasPreviousPage:1<o,nextPage:o+1,previousPage:o-1,lastPage:Math.ceil(n/ITEMS_PER_PAGE)})}).catch(function(t){var e=new Error(t);return e.httpStatusCode=500,r(e)})},exports.getProduct=function(t,e,r){var n=t.params.productId;Product.findById(n).then(function(t){e.render("shop/product-detail",{product:t,pageTitle:t.title,path:"/products"})}).catch(function(t){var e=new Error(t);return e.httpStatusCode=500,r(e)})},exports.getIndex=function(t,e,r){var n,o=+t.query.page||1;Product.find().countDocuments().then(function(t){return n=t,Product.find().skip((o-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)}).then(function(t){e.render("shop/index",{prods:t,pageTitle:"Shop",path:"/",currentPage:o,hasNextPage:ITEMS_PER_PAGE*o<n,hasPreviousPage:1<o,nextPage:o+1,previousPage:o-1,lastPage:Math.ceil(n/ITEMS_PER_PAGE)})}).catch(function(t){var e=new Error(t);return e.httpStatusCode=500,r(e)})},exports.getCart=function(t,r,n){t.user.populate("cart.items.productId").execPopulate().then(function(t){var e=t.cart.items;r.render("shop/cart",{path:"/cart",pageTitle:"Your Cart",products:e})}).catch(function(t){var e=new Error(t);return e.httpStatusCode=500,n(e)})},exports.postCart=function(e,r,t){var n=e.body.productId;Product.findById(n).then(function(t){return e.user.addToCart(t)}).then(function(t){console.log(t),r.redirect("/cart")})},exports.postCartDeleteProduct=function(t,e,r){var n=t.body.productId;t.user.removeFromCart(n).then(function(t){e.redirect("/cart")}).catch(function(t){return console.log(t)})},exports.getCheckout=function(e,r,n){var o,c=0;e.user.populate("cart.items.productId").execPopulate().then(function(t){return o=t.cart.items,c=0,o.forEach(function(t){c=t.quantity*t.productId.price}),stripe.checkout.sessions.create({payment_method_types:["card"],line_items:o.map(function(t){return{name:t.productId.title,description:t.productId.description,amount:100*t.productId.price,currency:"usd",quantity:t.quantity}}),success_url:e.protocol+"://"+e.get("host")+"/checkout/success",cancel_url:e.protocol+"://"+e.get("host")+"/checkout/cancel"})}).then(function(t){r.render("shop/checkout",{path:"/checkout",pageTitle:"Checkout",products:o,totalSum:c,sessionId:t.id})}).catch(function(t){var e=new Error(t);return e.httpStatusCode=500,n(e)})},exports.getCheckoutSuccess=function(r,e,n){r.user.populate("cart.items.productId").execPopulate().then(function(t){var e=t.cart.items.map(function(t){return{quantity:t.quantity,product:_objectSpread({},t.productId._doc)}});return new Order({user:{email:r.user.email,userId:r.user},products:e}).save()}).then(function(t){return r.user.clearCart()}).then(function(t){e.redirect("/orders")}).catch(function(t){var e=new Error(t);return e.httpStatusCode=500,n(e)})},exports.postOrder=function(r,e,n){r.user.populate("cart.items.productId").execPopulate().then(function(t){var e=t.cart.items.map(function(t){return{quantity:t.quantity,product:_objectSpread({},t.productId._doc)}});return new Order({user:{email:r.user.email,userId:r.user},products:e}).save()}).then(function(t){return r.user.clearCart()}).then(function(t){e.redirect("/orders")}).catch(function(t){var e=new Error(t);return e.httpStatusCode=500,n(e)})},exports.getOrders=function(t,e,r){Order.find({"user.userId":t.user._id}).then(function(t){e.render("shop/orders",{path:"/orders",pageTitle:"Your Orders",orders:t})}).catch(function(t){var e=new Error(t);return e.httpStatusCode=500,r(e)})},exports.getInvoice=function(c,u,i){var a=c.params.orderId;Order.findById(a).then(function(t){if(!t)return i(new Error("No order found"));if(t.user.userId.toString()!==c.user._id.toString())return i(new Error("Unauthorized"));var e="invoice-"+a+".pdf",r=path.join("data","invoices",e),n=new PDFDocument;u.setHeader("Content-Type","application/pdf"),u.setHeader("Content-Disposition",'inline; filename="'+e+'"'),n.pipe(fs.createWriteStream(r)),n.pipe(u),n.fontSize(26).text("Invoice",{underline:!0}),n.text("---------------------");var o=0;t.products.forEach(function(t){o+=t.quantity*t.product.price,n.fontSize(14).text(t.product.title+" - "+t.quantity+" x  $ "+t.product.price)}),n.text("---"),n.fontSize(20).text("Total Price: $ "+o),n.end()}).catch(function(t){return console.log(t)})};