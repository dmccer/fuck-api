var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var paramSchema = new Schema({
  // 所属接口
  apiId: Schema.Types.ObjectId,
  // 字段名称
  key: String,
  // 参数数据类型
  type: String,
  // 参数值集合
  values: [Schema.Types.Mixed],
  // 参数默认值
  defaultValue: Schema.Types.Mixed,
  // 是否必填
  required: Boolean,
  // 添加时间
  addTime: { type: Date, default: Date.now },
  // 更新时间
  updateTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Param', paramSchema);