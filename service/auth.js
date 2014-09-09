var Auth = require('../model/auth');
var md5 = require('md5');

module.exports = {
  checkLogin: function (req) {
    return !!(req.session && req.session.user);
  },

  find: function (data, callback) {
    Auth.find(data, callback);
  },

  findOne: function (data, callback) {
    Auth.findOne(data, callback);
  },

  create: function (data, callback) {
    data.password = md5.digest_s(data.password);

    Auth.create(data, callback);
  }
}