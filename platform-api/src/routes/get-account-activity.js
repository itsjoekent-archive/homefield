const Activity = require('../models/Activity');
const Account = require('../models/Account');
const loadAccount = require('../middleware/loadAccount');
const transformActivity = require('../transformers/transformActivity');

const PAGE_SIZE = 50;

module.exports = () => {
  async function handler(req, res) {
    const { account, db, params, query } = req;
    const { username } = params;

    let skip = 0;

    if (query.page) {
      if (isNaN(parseInt(query.page, 10))) {
        res.status(400).json({ error: 'Invalid page parameter '});
        return;
      }

      skip = (parseInt(query.page, 10) * PAGE_SIZE) - PAGE_SIZE;
    }

    const targetAccount = await Account(db).getAccountByUsername(username);

    if (targetAccount instanceof Error) {
      throw targetAccount;
    }

    if (!targetAccount) {
      res.status(404).json({ error: 'No account exists with this username' });
      return;
    }

    const result = await Activity(db).getPaginatedActivityForAccount(
      targetAccount,
      skip,
      PAGE_SIZE,
    );

    if (result instanceof Error) {
      throw result;
    }

    const { data, total } = result;

    res.json({
      meta: {
        total,
        limit: PAGE_SIZE,
        page: (skip / PAGE_SIZE) + 1,
        count: data.length,
      },
      data: {
        activity: data.map((activity) => transformActivity(activity, account)),
      },
    });
  }

  return ['get', '/accounts/:username/activity', handler, [loadAccount]];
};
