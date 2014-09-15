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
var ParamService = rewire('../service/param');

describe('param service', function() {
  describe('find params', function() {
    var Param = API.__get('Param');

    it('should return 3', function() {

    });
  });
});
