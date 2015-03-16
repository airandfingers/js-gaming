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
      type: 'date',
      //required: true,
      defaultsTo: function() {
        console.log('timestamp defaultsTo called');
        return new Date();
      }
    }
  }
};