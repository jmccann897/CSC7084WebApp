const axios = require("axios");
const path = require("path");

//Default route handler - getDefault
exports.getDefault = (req, res) => {
  res.sendFile(path.join(__dirname, "../html", "welcome.html"));
};

//route for getLogin
exports.getLogin = (req, res) => {
  res.status(200);
  res.render("login", { error: "", loggedin: false });
};

//route for postLogin
exports.postLogin = async (req, res) => {
  const vals = req.body;
  const endpoint = `http://localhost:3002/dash/users/`;
  const session = req.session;
  console.log(session);
  await axios
    .post(endpoint, vals, {
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
          res.render("login", {loggedin: false, error: "Invalid user credentials"});
        }
    })
    .catch((error) => {
        console.log(`Error making login post API request: ${error}`);
    });
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
          res.render("editsnap", { loggedin: isloggedin, details: data });
        } else{
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

  if (isloggedin) {
    res.render("addsnap", { loggedin: isloggedin });
  } else {
    res.render("login", { loggedin: false, error: "You must first log in" });
  }
};

//route for postAddsnap
exports.postAddsnap = async (req, res) => {
  const vals = ({
    happiness,
    sadness,
    anger,
    disgust,
    contempt,
    surprise,
    fear,
    context,
  } = req.body);
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

exports.getDatavis = async (req,res) =>{

  //const id = req.params.id;
  //console.log(id);
  const { id } = req.params;
  console.log(id);
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
      //some math functions to calculate data to send to render

      /* Data format
      {
  status: 'success',
  message: '56 records retrieved',
  result: [
    { datetime: '2024-01-21T12:06:20.000Z', emotion_id: 1, score: 1 },
    { datetime: '2024-01-21T12:06:20.000Z', emotion_id: 2, score: 1 },
    { datetime: '2024-01-21T12:06:20.000Z', emotion_id: 3, score: 1 },
    */

      const data = response.data;
      console.log(data);
      //res.render("datavis");
    } else {
      console.log(response.status);
      console.log(response.data);
      res.redirect("/dash");
    }
  })
  .catch((error) => {
    console.log(`Error making get Data Vis API request: ${error}`);
  });

  //need to get data to chart
  //get a count of all emotion types - bar
  //get the average score for each emotion - bar
  //plot the emotions vs time per emotion - line
  res.render("datavis");
}


//handler for all other paths --> 404 is static so could use Sendfile to a separate HTML file
//route for 404 - *
exports.get404 = (req, res) => {
  res.status(404);
  res.send("<h1>404 - Page Not Found!!</h1>");
};
