var API = require('../model/api');
var Param = require('../model/param');
var _ = require('underscore');
var async = require('async');

var createParam = function (params, callback) {
  if (!_.isArray(params)) {
    callback(null);
    return;
  }

  async.map(params, function (param, callback) {
    if (_.isArray(param)) {
      return createParam(param, callback);
    }

    if (_.isObject(param)  &&
      ['Object', 'Array'].indexOf(param.type) !== -1 &&
      param.values &&
      param.values.length) {
      return createParam(param.values, function (err, results) {
        param.values = results;
        Param.create(param, callback);
      });
    }

    Param.create(param, callback);
  }, callback);
};

module.exports = {
  find: function (data, callback) {
    API.find(data, callback);
  },

  findOne: function (data, callback) {
    API.findOne(data, callback);
  },

  create: function (data, callback) {
    var params = JSON.parse(data.data);
    delete data.data;

    API.create(data, function (err, res) {
      createParam(params, function (err, results) {
        res.data = results;

        res.save(callback);
      });
    });
  }
};

