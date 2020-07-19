const Campaign = require('../models/Campaign');
const loadAccount = require('../middleware/loadAccount');
const transformCampaign = require('../transformers/transformCampaign');

module.exports = () => {
  async function handler(req, res) {
    const { db, params, account } = req;
    const { campaignId } = params;

    const result = await Campaign(db).getCampaignById(campaignId);

    if (result instanceof Error) {
      throw result;
    }

    res.json({
      data: {
        campaign: transformCampaign(result, account),
      },
    });
  }

  return ['get', '/campaigns/:campaignId', handler, [loadAccount]];
};
