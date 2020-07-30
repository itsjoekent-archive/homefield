const { ObjectID } = require('mongodb');

const Account = require('../models/Account');
const Token = require('../models/Token');
const transformAccount = require('../transformers/transformAccount');
const transformToken = require('../transformers/transformToken');

module.exports = () => {
  async function handler(req, res) {
    const { body, db } = req;
    const { accountId, resetToken, password } = body;

    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    if (!resetToken) {
      res.status(400).json({ error: 'Missing reset token' });
      return;
    }

    const result = await Account(db).getAccountById(ObjectID(accountId));

    if (result instanceof Error) {
      throw result;
    }

    if (!result) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    if (!result.resetToken || !result.resetTokenExpiration) {
      res.status(401).json({ error: 'Reset token is invalid or expired' });
      return;
    }

    const isResetTokenValid = await Account(db).checkResetToken(result, resetToken);

    if (isResetTokenValid instanceof Error) {
      throw isResetTokenValid;
    }

    if (!isResetTokenValid) {
      res.status(401).json({ error: 'Reset token is invalid or expired' });
      return;
    }

    const hashedPassword = await Account(db).hashPassword(password);

    if (hashedPassword instanceof Error) {
      throw hashedPassword;
    }

    const { value: updatedAccount } = await Account(db).collection.findOneAndUpdate(
      { _id: result._id },
      {
        '$set': {
          password: hashedPassword,
          lastAuthenticationUpdate: Date.now(),
          updatedAt: Date.now(),
          resetToken: null,
          resetTokenExpiration: null,
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
        account: transformAccount(updatedAccount, updatedAccount),
        token: transformToken(token, updatedAccount),
      },
    });
  }

  return ['post', '/accounts/reset-password', handler];
}
