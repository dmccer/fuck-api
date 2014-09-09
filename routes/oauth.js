var express = require('express');
var router = express.Router();

var authService = require('../service/auth');
var oAuthService = require('../service/oauth');

router.get('/', function(req, res) {
  if (authService.checkLogin(req)) {
    res.render('oauth');
    return;
  }

  res.redirect('../login');
});

router.post('/', function (req, res) {
  var user = req.session && req.session.user;

  if (user && req.body) {
    var oauth = req.body;

    oauth.userId = user._id;

    oAuthService.findOne(oauth, function (err, doc) {
      if (err){
        res.render('oauth', {
          error: err.message
        })
        return;
      }

      if (!doc) {
        oAuthService.create(oauth, function (err, doc) {
          if (err){
            res.render('oauth', {
              error: err.message
            })
            return;
          }
          
          res.redirect('api/list');
        });
        return;
      }
      
      res.render('oauth', {
        error: '您已经添加过该 OAuth 认证信息'
      });
    })
  } else {
    res.render('oauth');  
  }
});

module.exports = router;
