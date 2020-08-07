const traceError = require('./traceError');

module.exports = (socket, logger, failedEvent) => {
  function onError(error) {
    const [trace, errorId] = traceError(error);

    logger.error(trace);
    return new Error(`Encountered error authenticating with chat server. errorId=${errorId}`);
  }

  return onError;
}
