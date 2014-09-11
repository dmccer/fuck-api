var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var apiSchema = new Schema({
  // 用户
  userId: Schema.Types.ObjectId,
  // 认证账户
  oauthId: Schema.Types.ObjectId,
  // 请求地址
  url: String,
  // 请求类型
  method: String,
  // 参数
  data: [Schema.Types.ObjectId],
  // 是否 post body 使用 json 字符串
  emulateJSON: Boolean,
  // 接口返回值
  responseData: String,
  // 接口返回值类型: json, html, xml, text
  dataType: String,
  // 该接口添加时间
  addTime: { type: Date, 'default': Date.now },
  // 该接口更新时间
  updateTime: { type: Date, 'default': Date.now }
});

module.exports = mongoose.model('API', apiSchema);
