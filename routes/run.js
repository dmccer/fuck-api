var express = require('express');
var router = express.Router();

var _ = require('underscore');
var authService = require('../service/auth');
var oAuthService = require('../service/oauth');
var RequestProxy = require('../service/request');
var apiService = require('../service/api');
var paramService = require('../service/param');

var async = require('async');

router.get('/:aid', function(req, res) {
  var user = req.session && req.session.user;

  if (user) {
    async.waterfall([
      function(callback) {
        apiService.findOne({
          _id: req.params.aid
        }, callback);
      },

      function(api, callback) {
        oAuthService.findOne({
          _id: api.oauthId
        }, function(err, oauth) {
          callback(err, _.defaults({}, api.toJSON(), oauth.toJSON()));
        });
      },

      function(api, callback) {
        paramService.findRecurive(api.data.length && api.data[0], function (err, param) {
          api.data = [param.toJSON()];
          callback(err, api);
        });
      },

      function (api, callback) {
      }
    ], function(err, result) {
      if (err) {
        res.render('run', {
          error: '查询接口信息失败',
          rs: []
        });

        return;
      }

      res.render('run', {
        rs: [result]
      });
    });
  }
});

module.exports = router;
