const Campaign = require('../models/Campaign');
const loadUser = require('../middleware/loadUser');
const superAdminOnly = require('../middleware/superAdminOnly');

module.exports = () => {
  async function handler(req, res) {
    const { db, params, user } = req;
    const { campaignId } = params;

    const reuslt = await Campaign(db).deleteCampaign(campaignId);

    if (result instanceof Error) {
      throw result;
    }

    res.json({ ok: true });
  }

  return ['delete', '/campaigns/:campaignId', handler, [loadUser, superAdminOnly]];
};
