const Campaign = require('../models/Campaign');
const loadUser = require('../middleware/loadUser');
const transformCampaign = require('../transformers/transformCampaign');

module.exports = () => {
  async function handler(req, res) {
    const { db, params, user } = req;
    const { campaignId } = params;

    const result = await Campaign(db).getCampaignById(campaignId);

    if (result instanceof Error) {
      throw result;
    }

    res.json({
      data: transformCampaign(result, user),
    });
  }

  return ['get', '/campaigns/:campaignId', handler, [loadUser]];
};
