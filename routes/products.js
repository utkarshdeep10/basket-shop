var express=require("express");
var app=express.Router();
var Products=require("../models/products");

// DisplayPage
app.get("/" , function(req, res) {
  
    Products.find({},
        function(err,allproducts) {
        if(err) console.log(err);
        else res.render("index", {products: allproducts});
        });
});

// Adding New Location to databases
app.post("/", function(req, res) {
    if(req.user && req.user.isAdmin) {
    var newProduct = {name: req.body.name, image: req.body.image, price: req.body.price};
    Products.create(newProduct, function(err,newadded) {
        if(err) console.log(err);
        else res.redirect("/main");
    });
    }
    else{
        res.render("errorpage");
    }
});

// Going to New Location Page
app.get("/new",  function(req, res) {
    if(req.user && req.user.isAdmin) res.render("addnew");
    else{
        res.render("errorpage");
    }
});

// Delete Page
app.delete("/:id",  function(req,res) {
    if(req.user && req.user.isAdmin) {
    Products.findByIdAndRemove(req.params.id, function(err){
        res.redirect("/main");
    });
}
else{
    res.render("errorpage");
}
});

// Add product to my cart
app.get("/cart/:id", function(req, res, next){
    var productId = req.params.id;
    Products.findById(productId,  function(err, product){
        if(err)
            console.log(err);
        if(typeof req.session.cart == "undefined"){
            req.session.cart = [];
            req.session.cart.push({
                name: product.name,
                id: productId,
                qty: 1,
                price: parseFloat(product.price).toFixed(2)
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;
            for(var i=0; i<cart.length; i++){
                if(cart[i].id == productId){
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if(newItem){
                cart.push({
                    name: product.name,
                    id: productId,
                    qty: 1,
                    price: parseFloat(product.price).toFixed(2)
                });
            }
        }
        res.redirect("back");
    });
});

module.exports = app;