const crypto = require('crypto');
const { promisify } = require('util');
const ms = require('ms');

const Account = require('../models/Account');
const mail = require('../mail');

const randomBytes = promisify(crypto.randomBytes);

module.exports = () => {
  async function handler(req, res) {
    const { body, db } = req;

    const { email } = body;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }

    const existingAccount = await Account(db).getAccountByEmail(email);

    if (existingAccount instanceof Error) {
      throw existingAccount;
    }

    if (!existingAccount) {
      res.status(200).json({ ok: true });
      return;
    }

    const resetTokenBuffer = await randomBytes(16);
    const resetToken = resetTokenBuffer.toString('hex');
    const resetTokenHashed = await Account(db).hashPassword(resetToken);

    if (resetTokenHashed instanceof Error) {
      throw resetTokenHashed;
    }

    const { value: updatedAccount } = await Account(db).collection.findOneAndUpdate(
      { _id: existingAccount._id },
      {
        '$set': {
          resetToken: resetTokenHashed,
          resetTokenExpiration: Date.now() + ms('2 hours'),
        },
      },
      { returnOriginal: false },
    );

    const mailResult = await mail(existingAccount.email, 'forgot-password', { account: updatedAccount, resetToken });

    if (mailResult instanceof Error) {
      throw mailResult;
    }

    res.status(200).json({ ok: true });
  }

  return ['post', '/accounts/request-password-reset', handler];
}
