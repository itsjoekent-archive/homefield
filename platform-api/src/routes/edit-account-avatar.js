const { GridFSBucket } = require('mongodb');

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

    const { filename } = body;

    if (!filename) {
      res.status(400).json({ error: 'Missing filename' });
      return;
    }

    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    const [file] = await bucket.find({ filename }).toArray();

    if (!file) {
      res.status(400).json({ error: 'File not found' });
      return;
    }

    const { value: updatedAccount } = await Account(db).collection.findOneAndUpdate(
      { _id: authenticatedAs._id },
      {
        '$set': {
          avatarUrl: `${process.env.HOST}/files/${filename}`,
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
  }

  return ['put', '/accounts/avatar', handler, [loadAccount]];
};
