var moment = require('moment');

module.exports = {
  identity: 'message',
  attributes: {
    sender: {
      type: 'string',
      required: true
    },
    message: {
      type: 'string',
      required: true
    },
    timestamp: {
      type: 'date'
    },
    readableTimestamp: function() {
      return moment(this.timestamp).fromNow();
    }
  }
};