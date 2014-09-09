var express = require('express');
var router = express.Router();

var authService = require('../service/auth');
var oAuthService = require('../service/oauth');

router.get('/', function(req, res) {
  res.render('register');
});

router.post('/', function (req, res) {
  if (req.body) {
    authService.findOne(req.body, function (err, doc) {
      if (err){
        res.render('register', {
          error: err.message
        })
        return;
      }

      if (!doc) {
        authService.create(req.body, function (err, user) {
          if (err) {
            res.render('register', {
              err: err.message
            });
            return;
          }

          req.session.user = user;
          res.redirect('api/list');
        });
        return;
      }

      res.render('register', {
        error: '该用户名已经注册'
      });
    });
    return;
  }

  res.render('register', {
    error: '请输入用户名和密码'
  });
});

module.exports = router;
