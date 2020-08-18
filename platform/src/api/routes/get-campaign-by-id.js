const { ObjectID } = require('mongodb');

const Campaign = require('../models/Campaign');
const loadAccount = require('../middleware/loadAccount');
const transformCampaign = require('../transformers/transformCampaign');

module.exports = () => {
  async function handler(req, res) {
    const { db, params, account } = req;
    const { campaignId } = params;

    const result = await Campaign(db).getCampaignById(ObjectID(campaignId));

    if (result instanceof Error) {
      throw result;
    }

    if (!result) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    res.json({
      data: {
        campaign: transformCampaign(result, account),
      },
    });
  }

  return ['get', '/campaigns/id/:campaignId', handler, [loadAccount]];
};
