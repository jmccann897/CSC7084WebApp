const express = require("express");
const morgan = require("morgan");
const PORT = 3000;


/*Array of JSON objects*/
const wishlist = [
  {"item": "Playstation 5"},
  {"item": "Sci fi novels"},
  {"item": "Selection box"},
  {"item": "Guitar"}
];

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
/*parser for incoming requests with URL encoding
extended allows for arrays eg JSON arrays*/
app.use(express.urlencoded({extended: true}));

//Routing - should be in own file structure
//route handler for http GET requests for default / paths
app.get("/", (req, res) => {
  res.status(200);
  /*If using static html - use sendFile to rel path
  res.sendFile(__dirname+ '/html/welcome.html');*/
  res.render('mytemplate', {title: "Dashboard data page", data});
});

//trying to add new path for form submission
app.get("/form", (req, res) =>{
  res.status(200);
  res.render('index', {data:wishlist});
});

//route for login
app.get("/login", (req,res) => {
  res.status(200);
  res.render('login')
})

//route for dashboard
app.get("/dash", (req,res) => {
  res.status(200);
  res.render('dash')
})

//route for signup
app.get("/signup", (req,res) => {
  res.status(200);
  res.render('signup')
})


//handler for all other paths
app.get("*", (req, res) => {
  res.status(404);
  res.send("<h1>Page Not Found!!</h1>");
});

//handler for POST requests
app.post('/', (req, res) =>{
  //var holding user submission
  const newitem = req.body;
  //add to array
  wishlist.push({"item": newitem.myitem});
  //render new view + updated array
  res.render('index', {data:wishlist});
});

//Binding the app object to server on specified port
app.listen(PORT, (err) => {
  if (err) return console.log(err);
  console.log(`Express Web Server listening on http://localhost:${PORT}`);
  console.log(__dirname);
});
