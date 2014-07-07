var express = require('express');
var router = express.Router();

var https = require('https');


/* GET home page. */
router.get('/', function(req, res) {
  var CB_URL = 'http://o.dp:3000/ok';
  var OAUTH_URL = 'https://sso.dper.com/oauth2.0/authorize?client_id=apollo&redirect_uri=' + CB_URL;
  
  res.redirect(OAUTH_URL);
});

module.exports = router;
