const bcrypt = require('bcrypt');

const Account = require('../models/Account');
const Token = require('../models/Token');
const loadAccount = require('../middleware/loadAccount');
const transformAccount = require('../transformers/transformAccount');
const transformToken = require('../transformers/transformToken');

module.exports = () => {
  async function handler(req, res) {
    const { body, db, account: authenticatedAs } = req;

    if (!authenticatedAs) {
      res.status(400).json({ error: 'Cannot edit an account while not logged in' });
      return;
    }

    const { password } = body;

    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { value: updatedAccount } = await Account(db).collection.findOneAndUpdate(
      { _id: authenticatedAs._id },
      {
        '$set': {
          password: hashedPassword,
          lastAuthenticationUpdate: Date.now(),
          updatedAt: Date.now(),
        },
      },
      { returnOriginal: false },
    );

    const token = await Token(db).createToken(updatedAccount);

    if (token instanceof Error) {
      throw token;
    }

    res.json({
      data: {
        account: transformAccount(updatedAccount, authenticatedAs),
        token: transformToken(token, authenticatedAs),
      },
    });
  }

  return ['post', '/accounts/password', handler, [loadAccount]];
};
