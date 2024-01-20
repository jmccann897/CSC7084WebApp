const express = require("express");
const { stat } = require("fs");
const path = require("path");
const conn = require('../utils/dbconn');
const controller = require('./../controllers/controllers');
//creating router object
const router = express.Router();

router.use(express.json()); //for parsing app/json
router.use(express.urlencoded({extended: true}));

//establishing path
const viewdir = path.join(__dirname,'..', 'ejs');

//get routes
router.get('/', controller.getDefault);
router.get('/edit/:id', controller.getEdit);
router.get('/form', controller.getForm);
router.get('/login', controller.getLogin);
router.get('/dash', controller.getDash);
router.get('/signup', controller.getSignup);
router.get('/addsnap', controller.getAddsnap);
router.get('*', controller.get404);
//post routes
router.post('/edit/:id', controller.postEdit);
router.post('/del/:id', controller.postDelete);
router.post('/addsnap', controller.postAddsnap);


module.exports = router;
