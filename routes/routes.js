const express = require("express");
const { stat } = require("fs");
const path = require("path");
const conn = require('../utils/dbconn');
//creating router object
const router = express.Router();

//establishing path
const viewdir = path.join(__dirname,'..', 'ejs');

//Routing - should be in own file structure
//route handler for http GET requests for default / paths
router.get("/", (req, res) => {
  res.status(200);
  //If using static html - use sendFile to rel path
    res.send('<h1>Welcome page</h1>')
  //res.render("welcome");
});

//trying to add new path for form submission
router.get("/form", (req, res) => {
  res.status(200);
  res.render("index", { data: wishlist });
});

//route for login
router.get("/login", (req, res) => {
  res.status(200);
  res.render("login");
});
//route for submitting login details via POST
router.post("/login", (req, res) =>{
  res.send('Post request recieved');
})

//route for dashboard
router.get("/dash", (req, res) => {
  //adding in sql reading -- NEED TO DO A JOIN QUERY TO GET DATES AND SCORES
  const selectSQL = 'SELECT * FROM  snapshot INNER JOIN snapshot_emotion ON snapshot.snapshot_id = snapshot_emotion.snapshot_id';
  //res.render('dash');
  
  conn.query(selectSQL, (err, rows) =>{
    if(err) {
      throw err;
    } else{
      console.log(rows);
      res.render('dash', {history: rows});
    }
  });
});

//route for signup
router.get("/signup", (req, res) => {
  res.status(200);
  res.render("signup");
});

//route for addsnap
router.get("/addsnap", (req, res) =>{
  res.status(200);
  res.render("addsnap");
})
//route for post form sub in addsnap
router.post("/addsnap", (req, res) => {
  const data = req.body;
  console.log(data);  
});

//handler for all other paths --> 404 is static so could use Sendfile to a separate HTML file
router.get("*", (req, res) => {
  res.status(404);
  res.send("<h1>404 - Page Not Found!!</h1>");
});

module.exports = router;
