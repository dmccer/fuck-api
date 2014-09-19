var API = require('../model/api');
var Param = require('../model/param');
var _ = require('underscore');
var async = require('async');

// var createParam = function(params, callback) {
//   if (!_.isArray(params)) {
//     callback(null);
//     return;
//   }
//
//   async.map(params, function(param, callback) {
//     if (_.isArray(param)) {
//       return createParam(param, callback);
//     }
//
//     if (_.isObject(param) && ['Object', 'Array'].indexOf(param.type) !== -1 &&
//       param.values &&
//       param.values.length) {
//
//       return createParam(param.values, function(err, results) {
//         console.log(typeof results);
//         console.log(results);
//
//         param.values = results.map(function(res) {
//           return res._id;
//         });
//
//         Param.create(param, callback);
//       });
//     }
//
//     Param.create(param, callback);
//   }, callback);
// };

var createParam = function(param, callback) {
  if (!param) {
    return callback(null);
  }

  if (param.type === 'Array') {
    var childType = param.childType;

    if (childType === 'Object') {
      return async.map(param.values, function(param, callback) {
        async.map(param, function(item, callback) {
          createParam(item, function(err, itemDoc) {
            callback(err, itemDoc && itemDoc._id);
          });
        }, callback);
      }, callback);
    }

    if (childType === 'Array') {
      return async.map(param.values, function(param, callback) {
        createParam(param, callback);
      }, callback);
    }

    return Param.create(param, callback);
  }

  if (param.type === 'Object') {
    return async.map(param.values, function(param, callback) {
      async.map(param, function(item, callback) {
        createParam(item, function(err, itemDoc) {
          callback(err, itemDoc && itemDoc._id);
        });
      }, callback);
    }, function (err, rs) {
      if (err) {
        return callback(err);
      }

      param.values = rs;
      Param.create(param, callback);
    });
  }

  return Param.create(param, callback);
};

module.exports = {
  find: function(data, callback) {
    API.find(data, callback);
  },

  findOne: function(data, callback) {
    API.findOne(data, callback);
  },

  create: function(data, callback) {
    var params = JSON.parse(data.data);
    delete data.data;

    API.create(data, function(err, res) {
      createParam(params, function(err, results) {
        res.data = results;
        res.save(callback);
      });
    });
  }
};
