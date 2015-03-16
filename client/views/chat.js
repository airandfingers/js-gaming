var _ = require('lodash');
var React = require('react');

var ENTER_KEY = 13;

var ChatMessages = React.createClass({
  getInitialState: function() {
    return {
      message_list: undefined
    };
  },
  componentDidMount: function() {
    var self = this;
    var messages = this.props.messages;
    console.log('ChatMessages.componentDidMount called, messages is', messages);
    if (! _.isObject(messages) || ! _.isFunction(messages.find)) {
      console.error('ChatMessages without messages!', messages);
      return;
    }
    messages.find({}, function(find_err, fetched_messages) {
      if (find_err || ! _.isArray(fetched_messages)) {
        console.error('messages.find returns', find_err, fetched_messages);
      }
      else if (! self.isMounted()) {
        console.warn('ChatMessages no longer mounted whe messages.find returns');
      }
      else {
        console.log('setting fetched_messages to', fetched_messages);
        self.setState({
          message_list: fetched_messages
        });
      }
    });
  },
  render: function() {
    console.log('ChatMessages.render called, message_list is', this.state.message_list);
    var messages_markup;
    if (! _.isArray(this.state.message_list)) {
      messages_markup = '';
    }
    else {
      messages_markup = this.state.message_list.map(function(message) {
        return (
          <div>
            <strong>{message.sender}:</strong> 
            <span>{message.message}</span>
            <span class="float-right">{message.readableTimestamp()}</span>
          </div>
        );
      });
    }
    return (
      <div class="chat_messages">
        {messages_markup}
      </div>
    );
  }
})

var ChatMessageForm = React.createClass({
  handleKeyDown: function(e) {
    if (e.which === ENTER_KEY) {
      e.preventDefault();
      this.handleSubmit();
    }
  },
  handleSubmit: function() {
    var message_input = this.refs.message.getDOMNode();
    var message = message_input.value;
    if (_.isEmpty(message)) {
      console.warn('handleSubmit called when message is', false);
    }
    else {
      message_input.value = '';
      this.props.onSubmit(message);
    }
  },
  render: function() {
    var room = this.props.room;
    console.log('ChatMessageForm.render called, room is', room);
    return (
      <form>
        <input
          ref="message"
          placeholder="Message"
          onKeyDown={this.handleKeyDown}
        />
      </form>
    );
  }
})

var ChatView = React.createClass({
  sendMessage: function(message) {
    var sender = this.props.sender;
    var messages = this.props.messages;
    console.log('in sendMessage', sender, message, messages);
    messages.create({
      sender: sender,
      message: message
    }, function(create_err, new_message, asdf) {
      if (create_err || ! _.isObject(new_message)) {
        console.error('messages.create returns', create_err, new_message);
      }
      else {
        console.log('new message created:', new_message.toObject());
      }
    });
  },
  render: function() {
    console.log('ChatView.render called with props:', this.props);
    return (
      <div>
        <ChatMessages messages={this.props.messages} />
        <ChatMessageForm
          room={this.props.room}
          onSubmit={this.sendMessage}
        />
      </div>
    );
  }
});

module.exports = ChatView;