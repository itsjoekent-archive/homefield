const crypto = require('crypto');

module.exports = function traceError(error) {
  const errorId = crypto.randomBytes(16).toString('hex');

  if (!error.message) {
    error.message = '';
  }

  error.message += `\nerrorId=${errorId}`;

  return [error, errorId];
}
