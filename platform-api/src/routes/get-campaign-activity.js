const { ObjectID } = require('mongodb');

const Activity = require('../models/Activity');
const Campaign = require('../models/Campaign');
const loadAccount = require('../middleware/loadAccount');
const transformActivity = require('../transformers/transformActivity');

const PAGE_SIZE = 50;

module.exports = () => {
  async function handler(req, res) {
    const { account, db, params, query } = req;
    const { campaignId } = params;

    let skip = 0;

    if (query.page) {
      if (isNaN(parseInt(query.page, 10))) {
        res.status(400).json({ error: 'Invalid page parameter '});
        return;
      }

      skip = (parseInt(query.page, 10) * PAGE_SIZE) - PAGE_SIZE;
    }

    const campaign = await Campaign(db).getCampaignById(ObjectID(campaignId));

    if (campaign instanceof Error) {
      throw campaign;
    }

    const result = await Activity(db).getPaginatedActivityForCampaign(
      campaign,
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

  return ['get', '/campaigns/:campaignId/activity', handler, [loadAccount]];
};
