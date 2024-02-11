const axios = require('axios');
const path = require('path');

//Default route handler - getDefault
exports.getDefault = (req, res) => {
  res.sendFile(path.join(__dirname, '../html', 'welcome.html'));
};

//route for getLogin
exports.getLogin = (req, res) => {
  res.status(200);
  res.render("login", { error: "" , loggedin: false});
};

//route for postLogin
exports.postLogin = async (req, res) => {

const vals = req.body;
const endpoint = `http://localhost:3002/dash/users/`;
const session = req.session;
console.log(session);

  await axios
  .post(endpoint, vals)
  .then((response)=>{
    const data = response.data.result;
    console.log("the data will follow this line");
    console.log(data);
    session.isloggedin = true;
    session.user_id = data[0].user_id;
    session.user_name = data[0].first_name;
    session.role = data[0].role;
    console.log(session);
    res.redirect('dash');
    //extract role from data then redirect to correct route for dash

  })
  .catch((error) =>{
    console.log(endpoint);
    console.log(`Error making login post API request: ${error}`);
  });
};
  /*
  const { email, userpass } = req.body;
  const vals = [email, userpass];
  const checkuserSQL = `SELECT user_id, first_name, role FROM reg_user 
    INNER JOIN user_type
    ON reg_user.user_type_id = user_type.user_type_id
    WHERE reg_user.email = ? AND reg_user.password = ?`;

  conn.query(checkuserSQL, vals, (err, rows) => {
    if (err) throw err;
    const numrows = rows.length;
    console.log(numrows);
    if (numrows > 0) {
     const session = req.session;
      session.isloggedin = true;
      session.user_id = rows[0].user_id;
      session.user_name = rows[0].first_name;
      session.role = rows[0].role;
      console.log(session);
      res.redirect("/dash");
    } else {
      console.log("Failed Login");
      res.render("login", { loggedin: false, error: "Incorrect login details" });
    }
  });
};
*/

//route for getLogout
exports.getLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

//route for getDash
exports.getDash = async (req, res) => {
  var userinfo ={};
  const {isloggedin, user_id} = req.session;
  const session = req.session;
  //const isloggedin = session.isloggedin;
  //const user_id = session.user_id;
  const user_name = session.user_name;
  const user_role = session.role;
  var userinfo ={name: user_name, role: user_role};
  console.log(session);
  console.log(userinfo);

  if (isloggedin && user_role == 'admin') {
    const endpoint = `http://localhost:3002/dash/admin/${user_id}`;

    await axios
    .get(endpoint)
    .then((response) => {
      const data = response.data.result;
      res.render('dash', {history: data, loggedin: isloggedin, user:userinfo});
    })
    .catch((error) =>{
      console.log(`Error making dash API request: ${error}`);
      res.render('login', {loggedin: false, error: "You must first log in"});
    });
} else if (isloggedin && user_role == 'user')  {
  const endpoint = `http://localhost:3002/dash/users/${user_id}`;
  await axios
    .get(endpoint)
    .then((response) => {
      const data = response.data.result;
      res.render('dash', {history: data, loggedin: isloggedin, user:userinfo});
    })
    .catch((error) =>{
      console.log(`Error making dash API request: ${error}`);
      res.render('login', {loggedin: false, error: "You must first log in"});
    });
};
};

//route for getEdit
exports.getEdit = async (req, res) => {
  const session = req.session;
  const isloggedin = session.isloggedin;
  const user_id = session.user_id;
  const user_name = session.user_name;
  const role = session.role;

  if (isloggedin) {
    //decontruct params to get snapID
    const { id } = req.params;

    const endpoint = `http://localhost:3002/edit/${id}`;

    await axios
    .get(endpoint)
    .then((response) => {
      const data = response.data;
      console.log("get edit data");
      console.log(data);
      res.render("editsnap", { loggedin: isloggedin, details: data });
    })
    .catch((error) => {
      //need to handle non -logged in case
      console.log(`Error making getEdit API request: ${error}`);
    });
  };
};

//route for postEdit 
exports.postEdit = async (req, res) => {

  const session = req.session;
  const isloggedin = session.isloggedin;

  if(isloggedin){
    const { id } = req.params;
    console.log(id);
    const vals = {context} = req.body;
    console.log(vals);
    const endpoint = `http://localhost:3002/edit/${id}`;
    console.log(endpoint);
    
    await axios
    .put(endpoint, vals)
    .then((response)=> {
      console.log(response.data);
      res.redirect('/dash');
    })
    .catch((error) => {
      console.log(`Error making edit put API request: ${error}`);
    });
  };
};

//route for postDelete
exports.postDelete = async (req, res) => {

  const id = req.params.id;

  const endpoint = `http://localhost:3002/del/${id}`;

  await axios
  .delete(endpoint)
  .then((response) => {
    console.log(response.data);
    res.redirect('/dash');
  })
  .catch((error) => {
    console.log(`Error making Delete API request: ${error}`);
  });
};

//route for getAddsnap
exports.getAddsnap = (req, res) => {
  const session = req.session;
  const isloggedin = session.isloggedin;
  const user_id = session.user_id;
  const user_name = session.user_name;
  const role = session.role;
  
  if (isloggedin) {
    res.render("addsnap", {loggedin: isloggedin});
  } else {
    res.render("login", {loggedin: false, error: "You must first log in" });
  }
};

//route for postAddsnap
exports.postAddsnap = async (req, res) => {
  const vals = { 
    happiness, sadness, anger, disgust,
    contempt, surprise, fear, context
  } = req.body;
  const endpoint = `http://localhost:3002/addsnap`;

  await axios
  .post(endpoint, vals)
  .then((response) => {
    const data = response.data;
    console.log(data);
    res.redirect('/dash');
  })
  .catch((error) => {
    console.log(`Error making postAddSnap API request: ${error}`);
  });
};

/*
  const data = req.body;
  const {
    happiness, sadness, anger, disgust,
    contempt, surprise, fear, context,
  } = req.body; //destructing must match names
  const user_id = req.session.user_id;
  const trigger_vals = [context, 2];
  const date_added = new Date().toISOString().slice(0, 19).replace("T", " ");
  const snapshot_vals = ["fake_img.url", date_added, user_id];
  const vals = [
    1,
    parseInt(happiness),
    2,
    parseInt(sadness),
    3,
    parseInt(disgust),
    4,
    parseInt(contempt),
    5,
    parseInt(anger),
    6,
    parseInt(fear),
    7,
    parseInt(surprise),
  ];
  */

  /* Trigger insert works when separated out but snapshot doesnt
    //online they say LAST_INSERT_ID() doesnt work as has connection scope
    //need to bring into one connection via one query. 
    //look into multiple statements in one connection (https://stackoverflow.com/questions/23266854/node-mysql-multiple-statements-in-one-query)
    //use connection.begin transaction */
/*
  conn.beginTransaction(function (err) {
    if (err) {
      throw err;
    }
    //trigger_context insert
    var triggerSQLinsert = `INSERT INTO trigger_context (trigger_description, icon_id) 
        VALUES (?,?);`;
    conn.query(triggerSQLinsert, trigger_vals, function (err, results) {
      if (err) {
        return conn.rollback(function () {
          console.log("Trigger insert error: " + err);
          throw err;
        });
        console.log("Trigger_context " + results.insertId + " added");
      }
      //get auto incremented value from above insert
      var rowID = results.insertId;
      //snapshot insert
      var snapshotSQLinsert = `INSERT INTO snapshot (image_url, datetime, user_id, trigger_id) 
        VALUES (?,?,?,${rowID});`;
      conn.query(snapshotSQLinsert, snapshot_vals, function (err, results) {
        if (err) {
          return conn.rollback(function () {
            console.log("Snapshot insert error: " + err);
            throw err;
          });
          console.log("Snapshot " + results.insertId + " added");
        }
        //get auto incremented value from above insert
        var rowID2 = results.insertId;
        //snapshot_emotion inserts
        var snapshot_emotionSQLinsert = `INSERT INTO snapshot_emotion (snapshot_id, emotion_id, score) 
          VALUES (${rowID2},?,?), (${rowID2},?,?), (${rowID2},?,?), (${rowID2},?,?), 
          (${rowID2},?,?), (${rowID2},?,?), (${rowID2},?,?)`;
        conn.query(snapshot_emotionSQLinsert, vals, function (err, results) {
          if (err) {
            return conn.rollback(function () {
              console.log("Snap_Emotion insert error: " + err);
              throw err;
            });
          }
          conn.commit(function (err) {
            if (err) {
              return conn.rollback(function () {
                throw err;
              });
            }
            console.log("Snapshot insert success!");
          });
        });
      });
    });
    res.redirect("/dash");
  });
};
*/

//handler for all other paths --> 404 is static so could use Sendfile to a separate HTML file
//route for 404 - *
exports.get404 = (req, res) => {
  res.status(404);
  res.send("<h1>404 - Page Not Found!!</h1>");
};
