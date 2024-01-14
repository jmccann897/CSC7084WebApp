const express = require("express");
const { stat } = require("fs");
const path = require("path");
const conn = require('../utils/dbconn');
//creating router object
const router = express.Router();

router.use(express.json()); //for parsing app/json
router.use(express.urlencoded({extended: true}));

//establishing path
const viewdir = path.join(__dirname,'..', 'ejs');

//Routing - should be in own file structure
//route handler for http GET requests for default / paths
router.get("/", (req, res) => {
  const SQLquery = `SELECT * FROM  snapshot 
  INNER JOIN snapshot_emotion 
  ON snapshot.snapshot_id = snapshot_emotion.snapshot_id`;
  conn.query(SQLquery, (err, rows) =>{
    if(err){
      throw err;
    } else{
      res.render('mytemplate', {history:rows});
    };
  });
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
  const selectSQL = `SELECT * FROM  snapshot 
  INNER JOIN snapshot_emotion 
  ON snapshot.snapshot_id = snapshot_emotion.snapshot_id`; 
  conn.query(selectSQL, (err, rows) =>{
    if(err) {
      throw err;
    } else {
      res.render('dash', {history: rows});
    };
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
});

//route for post form sub in addsnap
router.post("/addsnap", (req, res) => {
  const data = req.body;
  console.log(data);  

  const {happiness, sadness, anger, 
    disgust, contempt, surprise, 
    fear, context} = req.body; //destructing must match names

  const trigger_vals = [context, 2];
  const date_added = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const snapshot_vals = ['fake_img.url',date_added, 1];
  const snap_hap_vals =[1, parseInt(happiness)];
  const snap_sad_vals =[2, parseInt(sadness)];
  const snap_dis_vals =[3, parseInt(disgust)];
  const snap_con_vals =[4, parseInt(contempt)];
  const snap_ang_vals =[5, parseInt(anger)];
  const snap_fear_vals =[6, parseInt(fear)];
  const snap_surp_vals =[7, parseInt(surprise)];
  const vals=[1, parseInt(happiness), 2, parseInt(sadness), 3, parseInt(disgust), 4, parseInt(contempt), 5, parseInt(anger), 6, parseInt(fear), 7, parseInt(surprise)];
  
  

  console.log(vals);
  // Trigger insert works when separated out but snapshot doesnt
  // online they say LAST_INSERT_ID() doesnt work as has connection scope
  //need to bring into one connection via one query. 
  // look into multiple statements in one connection (https://stackoverflow.com/questions/23266854/node-mysql-multiple-statements-in-one-query)
  // use connection.begin transaction 

  conn.beginTransaction(function(err){
    if(err) {throw err;}
    
    var triggerSQLinsert = 'INSERT INTO trigger_context (trigger_description, icon_id) VALUES (?,?);';

    conn.query(triggerSQLinsert,trigger_vals, function(err, res){
      if(err){
        return conn.rollback(function(){
          console.log("Trigger insert error: "+err);
          throw err;
        });
        console.log("Trigger_context "+res.insertId+" added");
      }
      //get auto incremented value from above insert
      var rowID = res.insertId;
      var snapshotSQLinsert = 'INSERT INTO snapshot (image_url, datetime, user_id, trigger_id) VALUES (?,?,?,'+rowID+');';

      conn.query(snapshotSQLinsert, snapshot_vals, function(err, res){
        if (err) {
          return conn.rollback(function(){
            console.log("Snapshot insert error: "+err);
            throw err;
          });
          console.log("Snapshot "+res.insertId+" added");
        }
        //get auto incremented value from above insert
        var rowID2 = res.insertId;
        var snapshot_emotionSQLinsert = 'INSERT INTO snapshot_emotion (snapshot_id, emotion_id, score) VALUES ('+rowID2+',?,?), ('+rowID2+',?,?), ('+rowID2+',?,?), ('+rowID2+',?,?), ('+rowID2+',?,?), ('+rowID2+',?,?), ('+rowID2+',?,?)';

        conn.query(snapshot_emotionSQLinsert, vals, function(err, res){
          if (err){
            return conn.rollback(function(){
              console.log("Snap_Emotion insert error: "+err);
              throw err;
            });
            
          }
          conn.commit(function(err) {
            if (err) {
              return conn.rollback(function() {
                throw err;
              });
            }
            console.log('success!');
        })
        //close connection --> this caused an issue with moving to other routes
        //conn.end();
      });
    });
  });
});
});


 

//handler for all other paths --> 404 is static so could use Sendfile to a separate HTML file
router.get("*", (req, res) => {
  res.status(404);
  res.send("<h1>404 - Page Not Found!!</h1>");
});

module.exports = router;
