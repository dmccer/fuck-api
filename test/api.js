var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var assert = chai.assert;
var expect = chai.expect;
chai.should();
chai.use(sinonChai);

require('../lib/db');

var _ = require('underscore');
var rewire = require('rewire');
var API = rewire('../service/api');

describe('api service', function () {
  describe('create params', function () {
    var createParam = API.__get__('createParam');
    var _Param = API.__get__('Param');

    var users = (function () {
      var rs = [];
      var i = 0;

      while (i < 3) {
        rs.push([{
          key: 'name',
          type: 'String',
          values: ['u' + i],
          defaultValue: 'u' + 1,
          required: false
        }, {
          key: 'loginId',
          type: 'String',
          values: ['-9000' + i],
          defaultValue: '-9000' + i,
          required: true
        }]);

        i++;
      }

      return rs;
    })();

    var records = (function () {
      var rs = [];
      var i = 0;

      while (i < 3) {
        rs.push([
          {
            type: 'String',
            values: ['r' + i],
            defaultValue: 'r' + i,
            required: false
          }
        ]);

        i++;
      }

      return rs;
    })();

    var params = [{
      key: 'keyword',
      type: 'String',
      values: ['', '测试', 'ceishi', 'cs', 1, null],
      defaultValue: '',
      required: false
    }, {
      key: 'user',
      type: 'Object',
      values: users,
      defaultValue: users[0],
      required: true
    }, {
      key: 'records',
      type: 'Array',
      values: records,
      defaultValue: records[0],
      required: false
    }];

    it('should return undefined when params is not an array', function () {
      var params = '';
      createParam(params, function (err, results) {
        assert.isUndefined(results);
      });

      params = {};
      createParam(params, function (err, results) {
        assert.isUndefined(results);
      });

      params = false;
      createParam(params, function (err, results) {
        assert.isUndefined(results);
      });

      params = 123;
      createParam(params, function (err, results) {
        assert.isUndefined(results);
      });
    });

    it('should call create correct times', function () {
      var cb = sinon.spy();

      var Param = {
        create: function (param, callback) {
          cb();
          callback();
        }
      };

      API.__set__('Param', Param);

      createParam(params, function (err, results) {
        expect(cb).to.have.been.callCount(params.length + users.length + records.length);
      });
    });

    it('should return 3 of result length', function () {
      var Param = {
        create: function (param, callback) {
          callback(null, {
            _id: _.uniqueId('id')
          });
        }
      };

      API.__set__('Param', Param);

      createParam(params, function (err, results) {
        expect(results).to.have.length(3);
      });
    });

    it('should insert correct count', function () {
      API.__set__('Param', _Param);

      createParam(params, function (err, results) {
        expect(results).to.have.length(3);
      });
    });
  });
});
