// Including Packages
var express=require("express"),
    app=express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    passport=require("passport"),
    LocalStrategy=require("passport-local"),
    passportLocalMongoose=require("passport-local-mongoose"),
    User=require("./models/user"),
    session=require("express-session"),
    flash=require("connect-flash"),
    stripe=require("stripe")("**secret key***");

// Some Methods
mongoose.connect('mongodb://localhost/books', {
    useNewUrlParser: true,
    useCreateIndex: true
})

const productsroute=require("./routes/products");
const authroute=require("./routes/auth");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine" , "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
mongoose.set('useFindAndModify', false);


// Authentication
app.use(session({
    secret: "secretcart",
    resave: false,
    saveUninitialized: false,
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.get('*', function(req, res, next){
    res.locals.cart = req.session.cart;
    next();
})


app.use("/main", productsroute);
app.use(authroute);

app.get("/checkout", function(req, res){
    if(req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect("/checkout");
    }
    else{
        res.render("checkout");
    }
});

app.get("/clear", function(req, res){
    delete req.session.cart;
    req.flash("Success", "All items removed!");
    res.redirect("/checkout");
})

app.get("/update/:id", function(req, res){
    var productId = req.params.id;
    var cart = req.session.cart;
    var action = req.query.action;

    for(var i=0; i<cart.length; i++){
        if(cart[i].id == productId){
            switch(action){
                case "plus":
                    cart[i].qty++;
                    break;
                case "minus":
                    cart[i].qty--;
                    if(cart[i].qty < 1) cart.splice(i,1);
                    break;
                case "clear":
                    cart.splice(i,1);
                    if(cart.length == 0)
                        delete req.session.cart;
                    break;
                default:
                    console.log("Error in updating");
                    break;
            }
        break;
        }
    }
    res.redirect("back");
});

app.post("/charge", function(req, res) {
 
let amount = req.body.chargeAmount;
 
// create a customer
stripe.customers.create({
email: req.body.stripeEmail, // customer email
source: req.body.stripeToken // token for the card
})
.then(customer =>
stripe.charges.create({ // charge the customer
amount,
description: "Sample Charge",
currency: "inr",
customer: customer.id
}))
.then(charge =>{
    delete req.session.cart;
    res.render("charge", {amount : amount});
}); // render the payment successful alter page after payment
});

// Setting up server
app.listen(process.env.PORT || 3000, function() {
    console.log("Listening at port 3000");
});
