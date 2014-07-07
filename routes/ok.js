var express = require('express');
var router = express.Router();

router.get('/ok', function(req, res) {
  console.log(res.headers)
  res.render('ok', { title: 'SSO' });
});

module.exports = router;
