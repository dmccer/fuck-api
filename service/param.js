var Param = require('../model/param');
var async = require('async');
var _ = require('underscore');

// var findRecurive = function(values, callback) {
//   if (!_.isArray(values)) {
//     callback(null);
//     return;
//   }
//
//   async.each(values, function(value, callback) {
//     if (_.isArray(value)) {
//       return findRecurive(value, callback);
//     }
//
//     Param.findOne({
//       _id: value
//     }, function(err, param) {
//       if (param && ['Object', 'Array'].indexOf(param.type) !== -1 && param.values && param.values.length) {
//         return findRecurive(param.values, function(err, res) {
//           console.log('--' + res);
//           param.values = res;
//           callback(err, param);
//         });
//       }
//
//       console.log('- ' + param);
//       callback(err, param);
//     });
//   }, callback);
// };

var findR = function(id, callback) {
  if (!id) {
    return callback(null);
  }

  Param.findOne({
    _id: id
  }, function(err, doc) {
    if (doc.type === 'Array') {
      if (doc.childType === 'Object') {
        return async.map(doc.values, function(ids, callback) {
          async.map(ids, function(id, callback) {
            findR(id, callback);
          }, callback);
        }, function(err, rs) {
          if (err) {
            return callback(err);
          }

          doc.values = rs;

          callback(err, doc);
        });
      }

      if (doc.childType === 'Array') {
        return async.map(doc.values, function(id, callback) {
          findR(id, callback);
        }, function(err, rs) {
          if (err) {
            return callback(err);
          }

          doc.values = rs;

          callback(err, doc);
        });
      }

      return findR(id, callback);
    }

    if (doc.type == 'Object') {
      return async.map(doc.values, function(ids, callback) {
        async.map(ids, function(id, callback) {
          findR(id, callback);
        }, callback);
      }, function(err, rs) {
        if (err) {
          return callback(err);
        }

        doc.values = rs;

        callback(err, doc);
      });
    }

    callback(err, doc);
  });
};

var buildData = function(param) {
  var data = [];

  if (!param) {
    return;
  }

  if (param.type === 'Array') {
    if (param.childType === 'Array') {
      param.values.forEach(function(val) {
        data = data.concat(buildData(val));
      });

      return data;
    }

    if (param.childType === 'Object') {
      param.values.forEach(function(item) {
        item.forEach(function(val) {
          data = data.concat(buildData(val));
        });
      });

      return data;
    }

    return _.extend([], param.values);
  }

  if (param.type === 'Object') {
    param.values.forEach(function(item) {
      var tmp = {};

      var i, j, p, q, childData,
        itemRs = [],
        itemR = [];

      for (i = 0, p = item.length; i < p; i++) {
        itemR = [];
        tmp = {};
        childData = buildData(item[i]);

        for (j = 0, q = childData.length; j < q; j++) {
          tmp[item[i]] = childData[j];
          itemR.push(tmp);
        }

        itemRs.push(itemR);
      }

      data = data.concat(_.reduce(itemRs, function(itemRA, itemRB) {
        var itemR = [];

        itemRA.forEach(function(valA) {
          itemRB.forEach(function(valB) {
            itemR.push(_.extend({}, valA, valB));
          });
        });

        return itemR;
      }));
    });

    return data;
  }

  param.values.forEach(function(val) {
    var tmp = {};
    tmp[param.key] = val;
    data.push(tmp);
  });

  return data;
};

module.exports = {
  find: function(data, callback) {
    Param.find(data, callback);
  },

  findOne: function(data, callback) {
    Param.findOne(data, callback);
  },

  findRecurive: findR,

  create: function(data, callback) {
    Param.create(data, callback);
  },

  toData: function(param) {

  }
};
