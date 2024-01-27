const conn = require("./../utils/dbconn");
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
exports.postLogin = (req, res) => {
  const { email, userpass } = req.body;
  const vals = [email, userpass];
  const checkuserSQL = `SELECT user_id, first_name, role FROM reg_user 
    INNER JOIN user_type
    ON reg_user.user_type_id = user_type.user_type_id
    WHERE reg_user.email = ? AND reg_user.password = ?`;

  conn.query(checkuserSQL, vals, (err, rows) => {
    if (err) throw err;
    const numrows = rows.length;
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
      res.render("login", { error: "Incorrect login details" });
    }
  });
};

//route for getLogout
exports.getLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

//route for getDash
exports.getDash = (req, res) => {
  const session = req.session;
  const isloggedin = session.isloggedin;
  const user_id = session.user_id;
  const user_name = session.user_name;
  const role = session.role;
  
  if (isloggedin) {
    const selectSQL = `SELECT * FROM  snapshot 
    INNER JOIN snapshot_emotion 
    ON snapshot.snapshot_id = snapshot_emotion.snapshot_id 
    INNER JOIN trigger_context 
    ON snapshot.trigger_id = trigger_context.trigger_id
    WHERE user_id = ?`;
    
    conn.query(selectSQL, user_id, (err, rows) => {
      if (err) {
        throw err;
      } else {
        res.render("dash", { history: rows, loggedin: isloggedin });
      }
    });
  } else {
    res.render("login", { error: "You must first log in" });
  }
};


//route for getEdit
exports.getEdit = (req, res) => {
  const session = req.session;

  if (isloggedin) {
    //decontruct params to get snapID
    const { id } = req.params;

    const selectforEditSQL = `SELECT * FROM  snapshot 
      INNER JOIN snapshot_emotion 
      ON snapshot.snapshot_id = snapshot_emotion.snapshot_id 
      INNER JOIN trigger_context 
      ON snapshot.trigger_id = trigger_context.trigger_id 
      WHERE snapshot.snapshot_id = ? `;

    conn.query(selectforEditSQL, id, (err, rows) => {
      if (err) {
        throw err;
      } else {
        //console.log(rows);
        res.render("editsnap", { details: rows });
      }
    });
  } else {
    res.render("/login", { error: "You  must first log in" });
  }
};

//route for postEdit
exports.postEdit = (req, res) => {
  const snapshot_id = req.params.id;
  const trigger_description = req.body.context;
  const updateVals = [trigger_description, snapshot_id];
  const updateSQL = `UPDATE trigger_context 
    INNER JOIN snapshot ON trigger_context.trigger_id = snapshot.trigger_id
    SET  trigger_context.trigger_description = ?
    WHERE snapshot.snapshot_id = ?`;
  conn.query(updateSQL, updateVals, (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.redirect("/dash");
    }
  });
};

//route for postDelete
exports.postDelete = (req, res) => {
  const snapshot_id = req.params.id;
  const deleteSQL1 = `DELETE FROM snapshot_emotion WHERE snapshot_id = ?`;
  const deleteSQL2 = `DELETE FROM snapshot WHERE snapshot_id = ?`;

  conn.beginTransaction(function (err) {
    if (err) {
      throw err;
    }
    //first delete
    conn.query(deleteSQL1, snapshot_id, function (err, results) {
      if (err) {
        return conn.rollback(function () {
          console.log("Delete from snapshot table error: " + err);
          throw err;
        });
        console.log("Snapshot " + snapshot_id + " deleted from snapshot table");
      }
      //second deletion
      conn.query(deleteSQL2, snapshot_id, function (err, results) {
        if (err) {
          return conn.rollback(function () {
            console.log("Delete from snapshot_emotion table error: " + err);
            throw err;
          });
          console.log("Snapshot " + snapshot_id + " delete successful!");
        }
        conn.commit(function (err) {
          if (err) {
            return conn.rollback(function () {
              throw err;
            });
            console.log("Snapshot successfully deleted!");
          }
        });
      });
      res.redirect("/dash");
    });
  });
};


//route for getAddsnap
exports.getAddsnap = (req, res) => {
  const session = req.session;
  if (isloggedin) {
    res.render("addsnap");
  } else {
    res.render("login", { error: "You must first log in" });
  }
};

//route for postAddsnap
exports.postAddsnap = (req, res) => {
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

  /* Trigger insert works when separated out but snapshot doesnt
    //online they say LAST_INSERT_ID() doesnt work as has connection scope
    //need to bring into one connection via one query. 
    //look into multiple statements in one connection (https://stackoverflow.com/questions/23266854/node-mysql-multiple-statements-in-one-query)
    //use connection.begin transaction */

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

//handler for all other paths --> 404 is static so could use Sendfile to a separate HTML file
//route for 404 - *
exports.get404 = (req, res) => {
  res.status(404);
  res.send("<h1>404 - Page Not Found!!</h1>");
};
