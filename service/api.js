var API = require('../model/api');
var Param = require('../model/param');

var creatParam = function (params) {
  if (Object.prototype.toString.call(params) !== '[object Array]') {
    return;
  }

  var rs = [];

  params.forEach(function (param) {
    if (param.values && param.values.length) {
      param.values = createParam(param.values);
    }

    Param.create(param, function (err, res) {
      if (res) {
        rs.push(res._id);
      }
    });
  });

  return rs;
}

module.exports = {
  find: function (data, callback) {
    API.find(data, callback)
  },
  
  findOne: function (data, callback) {
    API.findOne(data, callback);
  },

  create: function (data, callback) {
    data.data = createParam(data.data);

    API.create(data, callback);
  }
}

