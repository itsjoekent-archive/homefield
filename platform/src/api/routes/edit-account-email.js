const Account = require('../models/Account');
const Token = require('../models/Token');
const loadAccount = require('../middleware/loadAccount');
const transformAccount = require('../transformers/transformAccount');
const transformToken = require('../transformers/transformToken');

module.exports = () => {
  async function handler(req, res) {
    const { body, db, account } = req;
    const { email, password } = body;

    if (!account) {
      res.status(401).json({ error: 'Must be authenticated to change emails' });
      return;
    }

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    const passwordComparison = await Account(db).comparePassword(account, password);

    if (passwordComparison instanceof Error) {
      throw passwordComparison;
    }

    if (!passwordComparison) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    // TODO: Send notification to current email

    let updatedAccount = null;

    try {
      const { value } = await Account(db).collection.findOneAndUpdate(
        { _id: account._id },
        {
          '$set': {
            email: email.toLowerCase().trim(),
            lastAuthenticationUpdate: Date.now(),
            updatedAt: Date.now(),
          },
        },
        { returnOriginal: false },
      );

      updatedAccount = value;
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ error: 'This email is already taken, sorry!' });
        return;
      }

      throw error;
    }

    const token = await Token(db).createToken(updatedAccount);

    if (token instanceof Error) {
      throw token;
    }

    res.json({
      data: {
        account: transformAccount(updatedAccount, updatedAccount),
        token: transformToken(token, updatedAccount),
      },
    });
  }

  return ['post', '/accounts/email', handler, [loadAccount]];
};
