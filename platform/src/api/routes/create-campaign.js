const Campaign = require('../models/Campaign');
const loadAccount = require('../middleware/loadAccount');
const superAdminOnly = require('../middleware/superAdminOnly');
const transformCampaign = require('../transformers/transformCampaign');

module.exports = () => {
  async function handler(req, res) {
    const { body, db, account } = req;

    const {
      name,
      location,
      logoUrl,
      adminEmail,
    } = body;

    if (!name) {
      res.status(400).json({ error: 'Missing campaign name' });
      return;
    }

    if (!location) {
      res.status(400).json({ error: 'Missing campaign location' });
      return;
    }

    if (!logoUrl) {
      res.status(400).json({ error: 'Missing campaign logo' });
      return;
    }

    if (!adminEmail) {
      res.status(400).json({ error: 'Missing campaign admin' });
      return;
    }

    const reuslt = await Campaign(db).createCampaign();

    if (result instanceof Error) {
      throw result;
    }

    // TODO: Create an invitation for the adminEmail

    res.json({
      data: {
        campaign: transformCampaign(result, account),
      },
    });
  }

  return ['post', '/campaigns', handler, [loadAccount, superAdminOnly]];
};
