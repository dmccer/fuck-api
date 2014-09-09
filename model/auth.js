var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var authSchema = new Schema({
  username: String,
  password: String,
  // 创建时间
  addTime: { type: Date, default: Date.now },
  // 更新时间
  updateTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Auth', authSchema);