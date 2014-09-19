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
  describe('find Object', function() {
    it('should return 3', function(done) {
      ParamService.findRecurive("5417fa7349abb0000042f8cc", function (err, results) {
        expect(results).to.be.an('Object');
        assert.equal(results.type, 'Object');
        done();
      });
    });
  });
});
