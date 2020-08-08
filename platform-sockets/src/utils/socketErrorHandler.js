const traceError = require('./traceError');

module.exports = (socket, logger) => {
  function onError(error) {
    const [trace, errorId] = traceError(error);

    logger.error(trace);

    const clientMessage = error.isSocketError ? error.message : `Encountered error with chat server. errorId=${errorId}`;
    socket.emit('exception', clientMessage);
  }

  return onError;
}
