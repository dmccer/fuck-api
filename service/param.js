var Param = require('../model/param');
var async = require('async');

module.exports = {
  find: function (data, callback) {
    Param.find(data, callback);
  },

  findOne: function (data, callback) {
    Param.findOne(data, callback);
  },

  findRecurive: function (pid, callback) {
    Param.findOne({
      _id: pid
    }, function (err, param) {
      if (['Object', 'Array'].indexOf(param.type) !== -1 && param.values && param.values.length) {
        // TODO
        // find param recursive
        async.each(param.values, function (param, callback) {

        }, callback);
      }

      callback(err, param);
    });
  },

  create: function (data, callback) {
    Param.create(data, callback);
  }
};
