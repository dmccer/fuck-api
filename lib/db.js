var mongoose = require('mongoose');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/base')[env];

var connect = function() {
  var options = {
    server: {
      socketOptions: {
        keepAlive: 1
      }
    }
  };
  mongoose.connect(config.db, options);
}

connect();

mongoose.connection.on('error', function(err) {
  console.log(err);
});

// Reconnect when closed
mongoose.connection.on('disconnected', function() {
  connect();
});
