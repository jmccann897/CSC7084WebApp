const express = require('express');
const path = require('path');
const controller = require('./../controllers/controllers');
const { isAuth } = require('./../middleware/mymiddleware');

//creating router object
const router = express.Router();


//establishing path
const viewdir = path.join(__dirname,'..', 'ejs');

//get routes
router.get('/', controller.getDefault);
router.get('/edit/:id', isAuth, controller.getEdit);
router.get('/login', controller.getLogin);
router.get('/logout', controller.getLogout);
router.get('/dash', isAuth, controller.getDash);
router.get('/addsnap', isAuth, controller.getAddsnap);
router.get('/datavis/:id', isAuth, controller.getDatavis);
router.get('*', controller.get404);

//post routes
router.post('/edit/:id', controller.postEdit);
router.post('/del/:id', controller.postDelete);
router.post('/addsnap', controller.postAddsnap);
router.post('/login', controller.postLogin);
router.post('/signup', controller.postSignUp);

module.exports = router;
