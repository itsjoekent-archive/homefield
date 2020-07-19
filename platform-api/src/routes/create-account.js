const Account = require('../models/Account');
const Token = require('../models/Token');
const loadAccount = require('../middleware/loadAccount');
const transformAccount = require('../transformers/transformAccount');
const transformToken = require('../transformers/transformToken');

module.exports = () => {
  async function handler(req, res) {
    const { body, db, account: authenticated } = req;

    if (!!authenticated) {
      res.status(400).json({ error: 'Cannot create a new account while logged in' });
      return;
    }

    const {
      email,
      password,
      firstName,
    } = body;

    // TODO: Better validation logic

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    if (!firstName) {
      res.status(400).json({ error: 'Missing first name' });
      return;
    }

    const existingAccount = await Account(db).getAccountByEmail(email);

    if (existingAccount instanceof Error) {
      throw existingAccount;
    }

    if (!!existingAccount) {
      res.status(400).json({ error: 'This email is already registered to an account' });
      return;
    }

    const account = await Account(db).createAccount(email, password, firstName);

    if (account instanceof Error) {
      throw account;
    }

    const token = await Token(db).createToken(account);

    if (token instanceof Error) {
      throw token;
    }

    res.json({
      data: {
        account: transformAccount(account, account),
        token: transformToken(token, account),
      },
    });
  }

  return ['post', '/accounts', handler, [loadAccount]];
};
