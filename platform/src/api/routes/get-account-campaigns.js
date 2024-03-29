const { ObjectID } = require('mongodb');

const Campaign = require('../models/Campaign');
const transformCampaign = require('../transformers/transformCampaign');
const loadAccount = require('../middleware/loadAccount');

module.exports = () => {
  async function handler(req, res) {
    const { account, db, params } = req;
    const { campaignId } = params;

    if (!account) {
      res.status(401).json({ error: 'You cannot signup for a campaign while not logged in' });
      return;
    }

    const campaigns = await Campaign(db).collection.find({
      _id: { '$in': account.campaigns },
    }).toArray();

    res.json({
      data: {
        campaigns: campaigns.map((campaign) => transformCampaign(campaign, account)),
      },
    });
  }

  return ['get', '/account/campaigns', handler, [loadAccount]];
};
