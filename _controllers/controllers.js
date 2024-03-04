const axios = require("axios");
const bcrypt = require("bcrypt");

//Default route handler - set to sign up
exports.getDefault = (req, res) => {
  res.status(200);
  res.render("signup", { error: "", loggedin: false });
};

//route for getSignup
exports.getSignUp = (req, res) => {
  res.status(200);
  res.render("signup", { error: "", loggedin: false });
};

//route for postSignUp
exports.postSignUp = async (req, res) => {
  const { email, userpass } = req.body; //destructuring
  const hash = await bcrypt.hash(userpass, 10); //hashing plaintext pswrd
  console.log(hash);

  const vals = {};
  vals.email = email;
  vals.hash = hash;
  console.log(vals); //need to be JS Objects

  let newuserflag = false;

  //api call to first check if already present
  const endpoint1 = `http://localhost:3002/dash/signup`;

  await axios
    .post(endpoint1, vals, {
      validateStatus: (status) => {
        return status < 500;
      },
    })
    .then((response) => {
      const status = response.status;
      if (status === 200) {
        //email present
        console.log("This email is present in DB therefore already registered");
        res.render("login", {
          loggedin: false,
          error: "You are already registered!",
        });
      } else {
        //email not present in DB so insert user!
        console.log("Email not present therefore can continue to sign up");
        newuserflag = true;
      }
    })
    .catch((error) => {
      console.log(`Error making email check API request: ${error}`);
    });

  if (newuserflag == true) {
    //api call to then insert new user
    const endpoint2 = `http://localhost:3002/dash/users/signup`;

    await axios
      .post(endpoint2, vals, {
        validateStatus: (status) => {
          return status < 500;
        },
      })
      .then((response) => {
        const status = response.status;
        if (status === 201) {
          //new user added to db therefore 201 code expected
          console.log("User registered successfully");
          res.redirect("/login");
        } else {
          //user not able to be added
          console.log(response.status);
          console.log(response.data);
          res.render("signup", {
            loggedin: false,
            error: "Invalid email",
          });
        }
      })
      .catch((error) => {
        console.log(`Error making new user insert API request: ${error}`);
      });
  }
};

//route for getLogin
exports.getLogin = (req, res) => {
  res.status(200);
  res.render("login", { error: "", loggedin: false });
};

//route for postLogin
exports.postLogin = async (req, res) => {
  const { email, userpass } = req.body; //destructuring
  
  const vals1 = {};
  vals1.email = email;
  const user = {};

  //api call to check if email present in DB 
  const endpoint1 = `http://localhost:3002/dash/usercheck`;
  await axios
    .post(endpoint1, vals1, {
      validateStatus: (status) => {
        return status < 500;
      },
    })
    .then((response) => {
      const status = response.status;
      if (status === 200) {
        const data = response.data.result;
        console.log(`This is the userpass: ${userpass}`);
        console.log(`This is the db pswrd: ${data[0].password}`);
        user.password = data[0].password;
      } else {
        console.log(response.status);
        console.log(response.data);
        res.render("login", {
          loggedin: false,
          error: "Invalid user credentials",
        });
      }
    })
    .catch((error) => {
      console.log(`Error making login email check API request: ${error}`);
    });

   //flag to continue if passwords match
   var regUserFlag = false;
   // bcrypt compare method to check if userpass = plaintext user input matches user.password = db stored hash
   const isMatch = await bcrypt.compare(userpass, user.password); 
   if(isMatch){
    //passwords match
    console.log("passwords match");
    regUserFlag = true;
    console.log(`flag status within match ${regUserFlag}`);
   } else {
    //passwords dont match
    console.log("passwords dont match");
    regUserFlag = false;
    res.render("login", {
      loggedin: false,
      error: "Invalid user credentials",
    });
    return; // Early return to prevent further execution
   }

   // if passwords match, flag allows for session and login
  if (regUserFlag == true) {
    const endpoint2 = `http://localhost:3002/dash/users/`;
    const session = req.session;
    console.log(session);
    console.log(regUserFlag);

     axios
      .post(endpoint2, vals1, {
        validateStatus: (status) => {
          return status < 500;
        },
      })
      .then((response) => {
        const status = response.status;
        if (status === 200) {
          const data = response.data.result;
          console.log("the data will follow this line");
          console.log(data);
          session.isloggedin = true;
          session.user_id = data[0].user_id;
          session.user_name = data[0].first_name;
          session.role = data[0].role;
          console.log(session);
          res.redirect("/dash");
        } else {
          console.log(response.status);
          console.log(response.data);
          res.render("login", {
            loggedin: false,
            error: "Invalid user credentials",
          });
        }
      })
      .catch((error) => {
        console.log(`Error making login post API request: ${error}`);
      });
  }
};

//route for getLogout
exports.getLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

//route for getDash
exports.getDash = async (req, res) => {
  var userinfo = {};
  const { isloggedin, user_id } = req.session;
  const session = req.session;
  const user_name = session.user_name;
  const user_role = session.role;

  var userinfo = { name: user_name, role: user_role, user_id: user_id };
  console.log(session);
  console.log(userinfo);

  if (isloggedin && user_role == "admin") {
    const endpoint = `http://localhost:3002/dash/admin/${user_id}`;
    await axios
      .get(endpoint, {
        validateStatus: (status) => {
          return status < 500;
        },
      })
      .then((response) => {
        const status = response.status;
        if (status === 200) {
          const data = response.data.result;
          console.log(userinfo);
          res.render("dash", {
            history: data,
            loggedin: isloggedin,
            user: userinfo,
          });
        } else {
          console.log(response.status);
          console.log(response.data);
          res.render("login", {
            loggedin: false,
            error: "You must first log in",
          });
        }
      })
      .catch((error) => {
        console.log(`Error making admin dash API request: ${error}`);
        res.render("login", {
          loggedin: false,
          error: "You must first log in",
        });
      });
  } else if (isloggedin && user_role == "user") {
    const endpoint = `http://localhost:3002/dash/users/${user_id}`;
    await axios
      .get(endpoint, {
        validateStatus: (status) => {
          return status < 500;
        },
      })
      .then((response) => {
        const status = response.status;
        if (status === 200) {
          const data = response.data.result;
          res.render("dash", {
            history: data,
            loggedin: isloggedin,
            user: userinfo,
          });
        } else {
          console.log(response.status);
          console.log(response.data);
          res.render("login", {
            loggedin: false,
            error: "You must first log in",
          });
        }
      })
      .catch((error) => {
        console.log(`Error making user dash API request: ${error}`);
        res.render("login", {
          loggedin: false,
          error: "You must first log in",
        });
      });
  } else {
    console.log("Someone trying to reach route without logging in");
    res.render("login", {
      loggedin: false,
      error: "You must first log in",
    });
  }
};

//route for getEdit
exports.getEdit = async (req, res) => {
  const session = req.session;
  const isloggedin = session.isloggedin;
  const user_id = session.user_id;
  const user_name = session.user_name;
  const role = session.role;

  var userinfo = { name: user_name, role: role, user_id: user_id };

  if (isloggedin) {
    //decontruct params to get snapID
    const { id } = req.params;

    const endpoint = `http://localhost:3002/edit/${id}`;

    await axios
      .get(endpoint, {
        validateStatus: (status) => {
          return status < 500;
        },
      })
      .then((response) => {
        const status = response.status;
        if (status === 200) {
          const data = response.data;
          console.log("get edit data");
          console.log(data);
          res.render("editsnap", {
            loggedin: isloggedin,
            details: data,
            user: userinfo,
          });
        } else {
          console.log(response.status);
          console.log(response.data);
          res.redirect("/dash");
        }
      })
      .catch((error) => {
        //need to handle non -logged in case
        console.log(`Error making getEdit API request: ${error}`);
      });
  }
};

//route for postEdit
exports.postEdit = async (req, res) => {
  const session = req.session;
  const isloggedin = session.isloggedin;

  if (isloggedin) {
    const { id } = req.params;
    console.log(id);
    const vals = ({ context } = req.body);
    console.log(vals);
    const endpoint = `http://localhost:3002/edit/${id}`;
    console.log(endpoint);

    await axios
      .put(endpoint, vals, {
        validateStatus: (status) => {
          return status < 500;
        },
      })
      .then((response) => {
        const status = response.status;
        if (status === 200) {
          console.log(response.data);
          res.redirect("/dash");
        } else {
          console.log(response.status);
          console.log(response.data);
          res.redirect("/dash");
        }
      })
      .catch((error) => {
        console.log(`Error making edit put API request: ${error}`);
      });
  }
};

//route for postDelete
exports.postDelete = async (req, res) => {
  const id = req.params.id;
  const endpoint = `http://localhost:3002/del/${id}`;

  await axios
    .delete(endpoint, {
      validateStatus: (status) => {
        return status < 500;
      },
    })
    .then((response) => {
      const status = response.status;
      if (status === 200) {
        console.log(response.data);
        res.redirect("/dash");
      } else {
        console.log(response.status);
        console.log(response.data);
        res.redirect("/dash");
      }
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

  var userinfo = { name: user_name, role: role, user_id: user_id };

  if (isloggedin) {
    res.render("addsnap", { loggedin: isloggedin, user: userinfo });
  } else {
    res.render("login", { loggedin: false, error: "You must first log in" });
  }
};

//route for postAddsnap
exports.postAddsnap = async (req, res) => {
  const session = req.session;
  const isloggedin = session.isloggedin;
  const user_id = session.user_id;
  const user_name = session.user_name;
  const role = session.role;

  var userinfo = { name: user_name, role: role, user_id: user_id };

  var formdata = ({
    happiness,
    sadness,
    anger,
    disgust,
    contempt,
    surprise,
    fear,
    context,
  } = req.body);

  var vals = {};
  vals.formdata = formdata;
  vals.userinfo = userinfo;

  const endpoint = `http://localhost:3002/addsnap`;

  await axios
    .post(endpoint, vals, {
      validateStatus: (status) => {
        return status < 500;
      },
    })
    .then((response) => {
      const status = response.status;
      if (status === 200) {
        const data = response.data;
        console.log(data);
        res.redirect("/dash");
      } else {
        console.log(response.status);
        console.log(response.data);
        res.redirect("/dash");
      }
    })
    .catch((error) => {
      console.log(`Error making postAddSnap API request: ${error}`);
    });
};

exports.getDatavis = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  const session = req.session;
  const isloggedin = session.isloggedin;
  const user_id = session.user_id;
  const user_name = session.user_name;
  const role = session.role;

  var userinfo = { name: user_name, role: role, user_id: user_id };

  const endpoint = `http://localhost:3002/dash/datavis/${id}`;

  await axios
    .get(endpoint, {
      validateStatus: (status) => {
        return status < 500;
      },
    })
    .then((response) => {
      const status = response.status;
      if (status === 200) {
        /* Data format
      {
  status: 'success',
  message: '56 records retrieved',
  result: [
    { datetime: '2024-01-21T12:06:20.000Z', emotion_id: 1, score: 1 },
    { datetime: '2024-01-21T12:06:20.000Z', emotion_id: 2, score: 1 },
    { datetime: '2024-01-21T12:06:20.000Z', emotion_id: 3, score: 1 },
    */

        /*
    EmotionID 1 = Happiness
    EmotionID 2 = Sadness
    EmotionID 3 = Disgust
    EmotionID 4 = Contempt
    EmotionID 5 = Anger
    EmotionID 6 = Fear
    EmotionID 7 = Surprise
    */

        const data = response.data;
        //variables to hold score count, totals and averages
        var emotionID1_count, emotionID1_total, emotionID1_avg;
        var emotionID2_count, emotionID2_total, emotionID2_avg;
        var emotionID3_count, emotionID3_total, emotionID3_avg;
        var emotionID4_count, emotionID4_total, emotionID4_avg;
        var emotionID5_count, emotionID5_total, emotionID5_avg;
        var emotionID6_count, emotionID6_total, emotionID6_avg;
        var emotionID7_count, emotionID7_total, emotionID7_avg;
        emotionID1_count = 0;
        emotionID1_total = 0;
        emotionID1_avg = 0;
        emotionID2_count = 0;
        emotionID2_total = 0;
        emotionID2_avg = 0;
        emotionID3_count = 0;
        emotionID3_total = 0;
        emotionID3_avg = 0;
        emotionID4_count = 0;
        emotionID4_total = 0;
        emotionID4_avg = 0;
        emotionID5_count = 0;
        emotionID5_total = 0;
        emotionID5_avg = 0;
        emotionID6_count = 0;
        emotionID6_total = 0;
        emotionID6_avg = 0;
        emotionID7_count = 0;
        emotionID7_total = 0;
        emotionID7_avg = 0;

        var results = data.result;

        //its counting the instances of happy scores, not the value of
        for (const key in results) {
          //console.log(`${key}: ${results[key]}`);
          if (results[key].emotion_id === 1) {
            emotionID1_count += 1; //instances of emotion1
            emotionID1_total += results[key].score; //Total for emotion1
          }
          if (results[key].emotion_id === 2) {
            emotionID2_count += 1; //instances of emotion1
            emotionID2_total += results[key].score; //Total for emotion1
          }
          if (results[key].emotion_id === 3) {
            emotionID3_count += 1; //instances of emotion1
            emotionID3_total += results[key].score; //Total for emotion1
          }
          if (results[key].emotion_id === 4) {
            emotionID4_count += 1; //instances of emotion1
            emotionID4_total += results[key].score; //Total for emotion1
          }
          if (results[key].emotion_id === 5) {
            emotionID5_count += 1; //instances of emotion1
            emotionID5_total += results[key].score; //Total for emotion1
          }
          if (results[key].emotion_id === 6) {
            emotionID6_count += 1; //instances of emotion1
            emotionID6_total += results[key].score; //Total for emotion1
          }
          if (results[key].emotion_id === 7) {
            emotionID7_count += 1; //instances of emotion1
            emotionID7_total += results[key].score; //Total for emotion1
          }
        }

        emotionID1_avg = emotionID1_total / emotionID1_count;
        emotionID2_avg = emotionID2_total / emotionID2_count;
        emotionID3_avg = emotionID3_total / emotionID3_count;
        emotionID4_avg = emotionID4_total / emotionID4_count;
        emotionID5_avg = emotionID5_total / emotionID5_count;
        emotionID6_avg = emotionID6_total / emotionID6_count;
        emotionID7_avg = emotionID7_total / emotionID7_count;

        const avgs = [
          emotionID1_avg,
          emotionID2_avg,
          emotionID3_avg,
          emotionID4_avg,
          emotionID5_avg,
          emotionID6_avg,
          emotionID7_avg,
        ];
        const totals = [
          emotionID1_total,
          emotionID2_total,
          emotionID3_total,
          emotionID4_total,
          emotionID5_total,
          emotionID6_total,
          emotionID7_total,
        ];
        console.log(`Averages ${avgs}`);
        console.log(`Totals ${totals}`);

        //data for emotion by time
        //store emotion data per time in array
        const happy_scores = [];
        const sad_scores = [];
        const disgust_scores = [];
        const contempt_scores = [];
        const anger_scores = [];
        const fear_scores = [];
        const surprise_scores = [];

        //loop through result
        for (const key in results) {
          //loop through all records
          if (results[key].emotion_id === 1) {
            //console.log(results[key]);
            happy_scores.push(results[key].datetime, results[key].score);
          }
          if (results[key].emotion_id === 2) {
            sad_scores.push(results[key].datetime, results[key].score);
          }
          if (results[key].emotion_id === 3) {
            disgust_scores.push(results[key].datetime, results[key].score);
          }
          if (results[key].emotion_id === 4) {
            contempt_scores.push(results[key].datetime, results[key].score);
          }
          if (results[key].emotion_id === 5) {
            anger_scores.push(results[key].datetime, results[key].score);
          }
          if (results[key].emotion_id === 6) {
            fear_scores.push(results[key].datetime, results[key].score);
          }
          if (results[key].emotion_id === 7) {
            surprise_scores.push(results[key].datetime, results[key].score);
          }
        }

        res.render("datavis", {
          loggedin: isloggedin,
          user: userinfo,
          avg_data: avgs,
          total_data: totals,
          happy_scores: happy_scores,
          sad_scores: sad_scores,
          disgust_scores: disgust_scores,
          contempt_scores: contempt_scores,
          anger_scores: anger_scores,
          fear_scores: fear_scores,
          surprise_scores: surprise_scores,
        });
      } else {
        console.log(response.status);
        console.log(response.data);
        res.redirect("/dash");
      }
    })
    .catch((error) => {
      console.log(`Error making get Data Vis API request: ${error}`);
    });
};

//handler for all other paths --> 404 is static so could use Sendfile to a separate HTML file
//route for 404 - *
exports.get404 = (req, res) => {
  res.status(404);
  res.send("<h1>404 - Page Not Found!!</h1>");
};
