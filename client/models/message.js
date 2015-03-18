var Waterline = require('waterline');
var stdSchema = require('app/abstract/waterline');
var message_schema = require('app/abstract/models/message');

console.log('schema is', message_schema);

message_schema.connection = 'rest';

module.exports = Waterline.Collection.extend(stdSchema(message_schema));