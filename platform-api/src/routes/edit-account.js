const Account = require('../models/Account');
const loadAccount = require('../middleware/loadAccount');
const transformAccount = require('../transformers/transformAccount');

module.exports = () => {
  async function handler(req, res) {
    const { body, db, account: authenticatedAs } = req;

    if (!authenticatedAs) {
      res.status(400).json({ error: 'Cannot edit an account while not logged in' });
      return;
    }

    const {
      firstName,
      lastName,
      username,
      twitterUsername,
      bio,
    } = body;

    // TODO: Better validation logic

    if (!firstName) {
      res.status(400).json({ error: 'Missing first name' });
      return;
    }

    try {
      const { value: updatedAccount } = await Account(db).collection.findOneAndUpdate(
        { _id: authenticatedAs._id },
        {
          '$set': {
            firstName,
            lastName,
            username,
            twitterUsername,
            bio,
            updatedAt: Date.now(),
          },
        },
        { returnOriginal: false },
      );

      res.json({
        data: {
          account: transformAccount(updatedAccount, authenticatedAs),
        },
      });
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ error: 'This username is already taken, sorry!' });
        return;
      }

      throw error;
    }
  }

  return ['put', '/accounts', handler, [loadAccount]];
};
