var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

module.exports = {
  development: {
    db: 'mongodb://localhost/dev',
    root: rootPath
  },
  test: {
    db: 'mongodb://localhost/test',
    root: rootPath
  },
  production: {}
}