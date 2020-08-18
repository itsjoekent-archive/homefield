const Account = require('../models/Account');
const mail = require('../mail');

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

    const result = await Account(db).generateResetToken(existingAccount);

    if (result instanceof Error) {
      throw result;
    }

    const [resetToken, updatedAccount] = result;

    const mailResult = await mail(existingAccount.email, 'forgot-password', { account: updatedAccount, resetToken });

    if (mailResult instanceof Error) {
      throw mailResult;
    }

    res.status(200).json({ ok: true });
  }

  return ['post', '/accounts/request-password-reset', handler];
}
