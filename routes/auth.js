var express=require("express");
var app=express.Router();
var passport=require("passport");
var User=require("../models/user");

// HomePage
app.get("/", function(req, res) {
    res.redirect("/main");
});

// Auth Routes 1. Register
app.get("/register", function(req,res) {
    res.render("register.ejs");
});

app.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    if(req.body.username === '********'){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err) {
                req.flash("error", err.message);
                return res.redirect("/register");   
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome " + user.username + "!");
            res.redirect("/main");
        });
    });
});

// Auth Routes 2. Login
app.get("/login", function(req,res) {
    res.render("login.ejs");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/main",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome Again!"
}), function(req,res){
});

// Auth Routes 3. Logout
app.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "Logged Out")
    res.redirect("back");
})

module.exports = app;
