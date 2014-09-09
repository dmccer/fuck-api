var express = require('express');
var router = express.Router();
var md5 = require('md5');

var authService = require('../service/auth');
var oAuthService = require('../service/oauth');

router.get('/', function(req, res) {
  if (authService.checkLogin(req)) {
    res.redirect('../api/list');
    return;
  }

  res.render('login');
});

router.post('/', function (req, res) {
  if (req.body) {
    authService.findOne({
      username: req.body.username
    }, function (err, doc) {
      if (err){
        res.render('login', {
          error: err.message
        })
        return;
      }

      if (!doc) {
        res.render('login', {
          error: '亲，您还没注册'
        });
        return;
      }

      if (doc.password !== md5.digest_s(req.body.password)) {
        res.render('login', {
          error: '密码不正确'
        });

        return;
      }

      console.log('用户信息： ')
      console.log(doc)

      req.session.user = doc;
      res.redirect('api/list');
    });
    return;
  }

  res.render('login', {
    error: '请输入用户名和密码'
  });
});

module.exports = router;
