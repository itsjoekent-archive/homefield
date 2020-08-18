const { ObjectID } = require('mongodb');

const Activity = require('../models/Activity');
const Campaign = require('../models/Campaign');
const transformActivity = require('../transformers/transformActivity');
const loadAccount = require('../middleware/loadAccount');

module.exports = () => {
  async function handler(req, res) {
    const { account, body, db } = req;
    const { campaignId, type, value } = body;

    if (!account) {
      res.status(401).json({ error: 'Cannot create activity when not authenticated' });
      return;
    }

    if (!campaignId) {
      res.status(400).json({ error: 'Missing campaign id' });
      return;
    }

    if (!['calls', 'texts'].includes(type)) {
      res.status(400).json({ error: 'Missing or invalid type' });
      return;
    }

    if (!value || isNaN(parseInt(value))) {
      res.status(400).json({ error: 'Missing or invalid value' });
      return;
    }

    const campaign = await Campaign(db).getCampaignById(ObjectID(campaignId));

    if (campaign instanceof Error) {
      throw campaign;
    }

    if (!campaign) {
      res.status(404).json({ error: 'This campaign does not exist' });
      return;
    }

    const activity = await Activity(db).createActivity(
      account,
      campaign,
      type,
      parseInt(value),
    );

    if (activity instanceof Error) {
      throw activity;
    }

    const output = {
      ...activity,
      account,
      campaign,
    };

    res.json({
      data: {
        activity: transformActivity(output, account),
      },
    });
  }

  return ['post', '/activity', handler, [loadAccount]];
}
