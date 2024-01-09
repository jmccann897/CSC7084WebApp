const express = require("express");
const morgan = require("morgan");
const mysql = require('mysql2');
const PORT = 3000;
const router = require('./routes/routes');

//creating express object rep our app
const app = express(); 

/*To dynamically render html, need to use engine
To use engine, it needs set on app object*/
app.set('view engine', 'ejs');

/*setting the directory for static files in public folder 
via express' static method
Use method allows mounting to app object*/
app.use(express.static(__dirname+ '/public'));

//Need to import node file system module
const fs = require('fs');
//Create data var and parse the data file containing JSON
const data = JSON.parse(
    fs.readFileSync(__dirname + '/data/students.json')
);

//provides minimal http req info logging
app.use(morgan("tiny"));

//db connection

/*parser for incoming requests with URL encoding
extended allows for arrays eg JSON arrays*/
app.use(express.json()); //for parsing app/json
app.use(express.urlencoded({extended: true}));

//routing --> handled in routes.js
app.use('/', router);

//Binding the app object to server on specified port
app.listen(PORT, (err) => {
  if (err) return console.log(err);
  console.log(`Express Web Server listening on http://localhost:${PORT}`);
});
