var express = require('express');
var router = express.Router();

var authService = require('../service/auth');
var oAuthService = require('../service/oauth');
var OAuthHelper = require('../lib/oauth');
var apiService = require('../service/api');

router.get('/', function (req, res) {
  if (!authService.checkLogin(req)) {
    res.redirect('/login');
    return;
  }

  var user = req.session && req.session.user;

  oAuthService.find({
    userId: user._id
  }, function (err, oauths) {
    if (err) {
      res.render('api-add', {
        error: '获取您添加的认证信息失败',
        oauths: []
      });
      return;
    }

    if (oauths) {
      res.render('api-add', {
        oauths: oauths
      });
      return;
    }

    res.redirect('../oauth');
  });
});

router.get('/list', function(req, res) {
  var user = req.session && req.session.user;

  if (user) {
    apiService.find({
      userId: user._id
    }, function (err, apis) {
      if (err) {
        res.render('api', {
          error: '获取您添加的接口失败',
          apis: []
        });
        return;
      }

      if (apis) {
        res.render('api', {
          apis: apis
        });
        return;
      }

      res.render('api', {
        error: '您还没有添加过接口',
        apis: []
      });
    });
    return;
  }

  res.redirect('/login');
});

router.post('/', function (req, res) {
  if (!authService.checkLogin(req)) {
    res.redirect('/login');
    return;
  }

  var user = req.session && req.session.user;

  var api = req.body;

  api.userId = user._id;

  apiService.create(api, function (err, api) {
    if (err) {
      console.log('添加接口失败:\n' + err);
      res.render('api-add', {
        error: '添加接口失败，请重试',
        oauths: []
      });
    }

    oAuthService.find({
      userId: user._id
    }, function (err, oauths) {
      if (err) {
        res.render('api-add', {
          error: '获取您添加的认证信息失败',
          oauths: []
        });
        return;
      }

      res.render('api-add', {
        error: '添加成功',
        oauths: oauths
      });
    });
  });
});
module.exports = router;
