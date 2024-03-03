const express = require("express");
const morgan = require("morgan");
const dotenv = require('dotenv').config({path:'./config.env'});
const session = require('express-session');
const router = require('./routes/routes');

//creating express object rep our app
const app = express(); 

//provides minimal http req info logging
app.use(morgan("tiny"));

/*To dynamically render html, need to use engine
To use engine, it needs set on app object*/
app.set('view engine', 'ejs');

/*setting the directory for static files in public folder 
via express' static method
Use method allows mounting to app object*/
app.use(express.static(__dirname+ '/public'));

/*parser for incoming requests with URL encoding
extended allows for arrays eg JSON arrays*/
app.use(express.json()); //for parsing app/json
app.use(express.urlencoded({extended: true}));

//initialising session middleware - prior to router
app.use(session({
  secret:'mysecretstring1234', //used to sign hash that is stored as session id in the cookie passed to client
  resave: false, // indicates session won't save on every req made
  saveUninitialized: false // indicates no session saved for a req that doesn't need to save sessions
}));

//routing --> handled in routes.js
app.use('/', router);

//Binding the app object to server on specified port
app.listen(process.env.PORT, (err) => {
  if (err) return console.log(err);
  console.log(`Express Web Server listening on http://localhost:${process.env.PORT}`);
});
