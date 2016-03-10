var express = require('express');
var router = express.Router();

/* GET BASIC PAGE */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET RETURNS home*/
router.get('/pages/home', function(req, res, next) {
  res.render('templates/home');
});


/* GET RETURNS*/
router.get('/pages/room', function(req, res, next) {
  res.render('templates/room');
});





module.exports = router;
