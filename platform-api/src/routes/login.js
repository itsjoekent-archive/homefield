const Account = require('../models/Account');
const Token = require('../models/Token');
const transformAccount = require('../transformers/transformAccount');
const transformToken = require('../transformers/transformToken');

module.exports = () => {
  async function handler(req, res) {
    const { body, db } = req;
    const { email, password } = body;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    const account = await Account(db).getAccountByEmail(email);

    if (account instanceof Error) {
      throw account;
    }

    if (!account) {
      res.status(401).json({ error: 'Invalid email/password' });
      return;
    }

    const passwordComparison = await Account(db).comparePassword(account, password);

    if (passwordComparison instanceof Error) {
      throw passwordComparison;
    }

    if (!passwordComparison) {
      res.status(401).json({ error: 'Invalid email/password' });
      return;
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

  return ['post', '/login', handler];
}
