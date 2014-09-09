var express = require('express');
var router = express.Router();

var authService = require('../service/auth');

/* GET home page. */
router.get('/', function(req, res) {
  if (authService.checkLogin(req)) {
    res.redirect('./api/list');
    return;
  }

  res.redirect('./login');
});

module.exports = router;
