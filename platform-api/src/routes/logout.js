const loadAccount = require('../middleware/loadAccount');
const Account = require('../models/Account');
const Token = require('../models/Token');

module.exports = () => {
  async function handler(req, res) {
    const { account, db, token } = req;

    if (!account) {
      res.status(401).json({ error: 'Not autneticated' });
      return;
    }

    const accountUpdateResult = await Account(db).collection.findOneAndUpdate(
      { _id: account._id },
      { '$set': { lastAuthenticationUpdate: Date.now() } },
    );

    if (accountUpdateResult instanceof Error) {
      throw accountUpdateResult;
    }

    const tokenDeleteResult = await Token(db).deleteToken(token._id);

    if (tokenDeleteResult instanceof Error) {
      throw tokenDeleteResult;
    }

    res.status(202).send();
  }

  return ['post', '/logout', handler, [loadAccount]];
}
