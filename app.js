//jshint esversion:6
//Requirements and Utils
require('dotenv').config()
const express = require("express");
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 5;
const md5 = require('md5');
//const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

//Database settings
mongoose.connect("mongodb://localhost:27017/secretsDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//const secret = process.env.SECRET;
//userSchema.plugin(encrypt,{secret: secret, encryptedFields:['password']});

const User = mongoose.model("User", userSchema);

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
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username},(err, foundUser)=>{
        if(err){ console.log(err); }
        else{
            if(foundUser){
                bcrypt.compare( password, foundUser.password, function(err, result) {
                    if(!err){
                        if(result === true){
                        res.render('secrets')
                        } else { res.send('Password Mismatch!') }
                }}) 
            }
        }
    })
});

//Register Route
app.route("/register")
.get((req,res)=>{
    res.render('register')
})
.post((req,res)=>{

    bcrypt.hash(req.body.password, saltRounds, (err, hash)=>{
        const newUser = new User({
            email: req.body.username,
            password: hash
        })
        newUser.save((err)=>{
            if(err){ console.log(err) }
            else { res.render('secrets') }
        })
    })
});

//Listen
app.listen(3000, function(){
    console.log("Server started on port 3000!");
});