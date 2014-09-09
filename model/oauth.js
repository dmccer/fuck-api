var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var oAuthSchema = new Schema({
  authHost: String,
  username: String,
  password: String,
  clientId: String,
  clientSecret: String,
  redirectUrl: String,
  userId: Schema.Types.ObjectId,
  // 创建时间
  addTime: { type: Date, default: Date.now },
  // 更新时间
  updateTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OAuth', oAuthSchema);