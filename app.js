//jshint esversion:6
//Requirements and Utils
require('dotenv').config()
const express = require("express");
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(session({
    secret: "IamJustTesting",
    saveUninitialized: false,
    resave: false
}));

app.use(passport.initialize());
app.use(passport.session());

//Database settings
mongoose.connect("mongodb://localhost:27017/secretsDB", {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true, 
    useFindAndModify: false
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
const secretSchema = { secret: String };
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
const Secret = mongoose.model("Secret", secretSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Application routes and Logics
app.route("/")
.get((req,res)=>{
    res.render('home')
});

//Login route
app.route("/login")
.get((req,res)=>{
    res.render('login')
})
.post((req,res)=>{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, (err)=>{
        if(err){
            console.log(err);
            res.redirect('/login')
        } else{
            passport.authenticate('local')(req,res,()=>{
                res.redirect('/secrets')
            })
        }
    })
});

//Register Route
app.route("/register")
.get((req,res)=>{
    res.render('register')
})
.post((req,res)=>{
    User.register({username : req.body.username}, req.body.password, (err,user)=>{
        if(err){
            console.log(err);
            res.redirect("/register")
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets")
            })
        }
    } )
});

//Secrets Route
app.route("/secrets")
.get((req,res)=>{
    if(req.isAuthenticated()){
        Secret.find({}, (err,found)=>{
            res.render("secrets", {doc : found});
        })
    } else{
        res.redirect("/login")
    }
});

//Submit Route
app.route("/submit")
.get((req,res)=>{
    if(req.isAuthenticated()){
        res.render("submit");
    } else{
        res.redirect("/login")
    } 
})
.post((req,res)=>{
    Secret.findOneAndUpdate({ secret: req.body.secret }, {} , { upsert: true} , ()=>{
        res.redirect("/secrets")
    });
    
});

//LogOut route
app.get('/logout',(req,res)=>{
    req.logOut();
    res.redirect('/');
});

//Listen
app.listen(3000, function(){
    console.log("Server started on port 3000!");
});