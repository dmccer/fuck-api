var Param = require('../model/param');
var async = require('async');

var findRecurive = function(values, callback) {
  if (!_.isArray(values)) {
    callback(null);
    return;
  }

  async.each(values, function(value, callback) {
    if (_.isArray(value)) {
      return findRecurive(value, callback);
    }

    Param.findOne({
      _id: value
    }, function(err, param) {
      if (['Object', 'Array'].indexOf(param.type) !== -1 && param.values && param.values.length) {
        return findRecurive(param.values, function(err, res) {
          param.values = res;
          callback(err, param);
        });
      }

      callback(err, param);
    });
  }, callback);
};

module.exports = {
  find: function(data, callback) {
    Param.find(data, callback);
  },

  findOne: function(data, callback) {
    Param.findOne(data, callback);
  },

  findRecurive: findRecurive,

  create: function(data, callback) {
    Param.create(data, callback);
  }
};
