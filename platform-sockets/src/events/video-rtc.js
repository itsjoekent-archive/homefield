const socketErrorHandler = require('../utils/socketErrorHandler');
const wrapAsyncFunction = require('../utils/wrapAsyncFunction');

module.exports = ({ socket }) => {
  socket.on('broadcaster', () => {
    broadcaster = socket.id;
    socket.broadcast.emit('broadcaster');
  });

  socket.on('watcher', () => {
    socket.to(broadcaster).emit('watcher', socket.id);
  });

  socket.on('disconnect', () => {
    socket.to(broadcaster).emit('disconnectPeer', socket.id);
  });
}
