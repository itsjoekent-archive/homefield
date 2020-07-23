const { ObjectID } = require('mongodb');

const Account = require('../models/Account');
const Campaign = require('../models/Campaign');
const loadAccount = require('../middleware/loadAccount');
const transformAccount = require('../transformers/transformAccount');

module.exports = () => {
  async function handler(req, res) {
    const { db, params, account } = req;
    const { accountId } = params;

    const isAccountId = ObjectID.isValid(accountId);

    const queryValue = isAccountId ? ObjectID(accountId) : accountId;
    const queryMethod = isAccountId ? 'getAccountById' : 'getAccountByUsername';

    const result = await Account(db)[queryMethod](queryValue);

    if (result instanceof Error) {
      throw result;
    }

    if (!result) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    const campaigns = await Campaign(db).collection.find({
      _id: { '$in': result.campaigns },
    }).toArray();

    if (campaigns instanceof Error) {
      throw campaigns;
    }

    const joined = {
      ...result,
      campaigns,
    };

    res.json({
      data: {
        account: transformAccount(joined, account),
      },
    });
  }

  return ['get', '/accounts/:accountId', handler, [loadAccount]];
};
