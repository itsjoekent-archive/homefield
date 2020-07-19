const loadAccount = require('../middleware/loadAccount');
const transformAccount = require('../transformers/transformAccount');
const transformToken = require('../transformers/transformToken');

module.exports = () => {
  async function handler(req, res) {
    const { account, token } = req;

    if (!account) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json({
      data: {
        account: transformAccount(account, account),
        token: transformToken(token, account),
      },
    });
  }

  return ['post', '/token/verify', handler, [loadAccount]];
};
