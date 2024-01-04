const express = require("express");
const path = require("path");
//creating router object
const router = express.Router();

//establishing path
const viewdir = path.join(__dirname,'..', 'ejs');

//Routing - should be in own file structure
//route handler for http GET requests for default / paths
router.get("/", (req, res) => {
  res.status(200);
  /*If using static html - use sendFile to rel path
    res.sendFile(__dirname+ '/html/welcome.html');*/
  res.render("mytemplate", { title: "Dashboard data page", data });
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

//route for dashboard
router.get("/dash", (req, res) => {
  res.status(200);
  res.render("dash");
});

//route for signup
router.get("/signup", (req, res) => {
  res.status(200);
  res.render("signup");
});

//handler for all other paths --> 404 is static so could use Sendfile to a separate HTML file
router.get("*", (req, res) => {
  res.status(404);
  res.send("<h1>Page Not Found!!</h1>");
});

//handler for POST requests
router.post("/", (req, res) => {
  //var holding user submission
  const newitem = req.body;
  //add to array
  wishlist.push({ item: newitem.myitem });
  //render new view + updated array
  res.render("index", { data: wishlist });
});

module.exports = router;
