module.exports = function SocketError(message) {
  const error = new Error(message);
  error.isSocketError = true;

  return error;
}
