var Waterline = require('waterline');
var stdSchema = require('app/abstract/waterline');
var message_schema = require('app/abstract/models/message');

message_schema.connection = 'database';
message_schema.tableName = 'messages';

message_schema.attributes.timestamp.defaultsTo = function() { return new Date(); }

module.exports = function(waterline) {
  var MessageCollection = Waterline.Collection.extend(stdSchema(message_schema));
  waterline.loadCollection(MessageCollection);
}