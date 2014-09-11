var OAuth = require('../model/oauth');

module.exports = {
  find: function (data, callback) {
    OAuth.find(data, callback);
  },

  findOne: function (data, callback) {
    OAuth.findOne(data, callback);
  },

  create: function (data, callback) {
    OAuth.create(data, callback);
  }
};
