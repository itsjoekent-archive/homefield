const Campaign = require('../models/Campaign');
const loadAccount = require('../middleware/loadAccount');
const superAdminOnly = require('../middleware/superAdminOnly');

module.exports = () => {
  async function handler(req, res) {
    const { db, params } = req;
    const { campaignId } = params;

    const reuslt = await Campaign(db).deleteCampaign(campaignId);

    if (result instanceof Error) {
      throw result;
    }

    res.json({ ok: true });
  }

  return ['delete', '/campaigns/:campaignId', handler, [loadAccount, superAdminOnly]];
};
