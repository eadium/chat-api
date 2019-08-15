const users = require('./user_routes');
const chats = require('./chat_routes');
const messages = require('./msg_routes');

module.exports = (app) => {
  app.post('/users/add', users.addUser);
  app.post('/chats/add', chats.addChat);
  app.post('/messages/add', messages.addMessage);
  app.post('/chats/get', chats.getUserChat);
  app.post('/messages/get', messages.getChatMessages);

};
