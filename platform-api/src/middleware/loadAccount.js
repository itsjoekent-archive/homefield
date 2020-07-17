const Token = require('../models/Token');
const Account = require('../models/Account');

module.exports = async function loadAccount(req, res, next) {
  const authorization = req.headers['Authorization'];
  req.account = null;

  if (authorization) {
    const { db } = req;
    const bearer = authorization.replace('Bearer ', '');

    const token = await Token(db).findTokenByBearer(bearer);

    if (token instanceof Error) {
      throw token;
    }

    if (token) {
      const account = await Account(db).getAccountById(token.account);

      if (account instanceof Error) {
        throw account;
      }

      if (!!account) {
        req.account = account;
      }
    }
  }

  next();
}
