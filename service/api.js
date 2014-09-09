var API = require('../model/api');

module.exports = {
  find: function (data, callback) {
    API.find(data, callback)
  },
  
  findOne: function (data, callback) {
    API.findOne(data, callback);
  },

  create: function (data, callback) {
    API.create(data, callback);
  }
}

