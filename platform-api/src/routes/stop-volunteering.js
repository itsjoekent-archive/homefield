const { ObjectID } = require('mongodb');

const Account = require('../models/Account');
const Campaign = require('../models/Campaign');
const transformAccount = require('../transformers/transformAccount');
const transformCampaign = require('../transformers/transformCampaign');
const loadAccount = require('../middleware/loadAccount');

module.exports = () => {
  async function handler(req, res) {
    const { account, db, params } = req;
    const { campaignId } = params;

    if (!account) {
      res.status(401).json({ error: 'You cannot stop volunteering for a campaign while not logged in' });
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

    const { value: updatedAccount } = await Account(db).collection.findOneAndUpdate(
      { _id: account._id },
      { '$pull': { campaigns: campaign._id } },
      { returnOriginal: false },
    );

    res.json({
      data: {
        account: transformAccount(updatedAccount, account),
        campaign: transformCampaign(campaign, account),
      },
    });
  }

  return ['delete', '/campaigns/:campaignId/volunteer', handler, [loadAccount]];
};
