const Account = require('../../lib/models/Account');
const Token = require('../../lib/models/Token');

const socketErrorHandler = require('../utils/socketErrorHandler');
const wrapAsyncFunction = require('../utils/wrapAsyncFunction');

module.exports = ({ socket, logger, mongoDb, redisClient }) => {
  async function onAuth(data) {
    const token = await Token(mongoDb).findTokenByBearer(data);

    if (token instanceof Error) {
      throw token;
    }

    if (!token) {
      throw new Error('Token does not exist');
    }

    socket.token = token;

    const account = await Account(mongoDb).getAccountById(token.account);

    if (account instanceof Error) {
      throw account;
    }

    if (!account) {
      throw new Error('Account does not exist');
    }

    socket.account = account;
    socket.isAuthenticated = true;

    socket.emit('AUTH_SUCCESS');
  }

  socket.on('AUTH', wrapAsyncFunction(onAuth, socketErrorHandler(socket, logger)));
}
