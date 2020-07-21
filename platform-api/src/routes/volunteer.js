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
      res.status(401).json({ error: 'You cannot signup for a campaign while not logged in' });
      return;
    }

    const campaign = await Campaign(db).getCampaignById(campaignId);

    if (campaign instanceof Error) {
      throw campaign;
    }

    if (!campaign) {
      res.status(404).json({ error: 'This campaign does not exist' });
      return;
    }

    const { firewall } = campaign;
    const conflicts = firewall && firewall.filter((firewalledCampaignId) => (
      account.campaigns.includes(firewalledCampaignId)
    ));

    if (conflicts && conflicts.length) {
      const conflictedCampaigns = await Promise.all(conflicts.map((conflictedCampaignId) => (
        Campaign(db).getCampaignById(conflictedCampaignId)
      )));

      const conflictedCampaignNames = conflictedCampaigns
        .map((conflictedCampaign) => {
          if (conflictedCampaign instanceof Error) {
            throw conflictedCampaign;
          }

          if (!conflictedCampaign) {
            return null;
          }

          return conflictedCampaign.name;
        })
        .filter((name) => !!name)
        .join(',');

      res.status(400).json({
        error: `You are cannot volunteer for this campaign while volunteering for ${conflictedCampaigns}`,
      });

      return;
    }

    const { value: updatedAccount } = await Account(db).collection.findOneAndUpdate(
      { _id: account._id },
      { '$push': { campaigns: campaign._id.toString() } },
      { returnOriginal: false },
    );

    console.log(updatedAccount, campaign);

    res.json({
      data: {
        account: transformAccount(updatedAccount, account),
        campaign: transformCampaign(campaign, account),
      },
    });
  }

  return ['post', '/campaigns/:campaignId/volunteer', handler, [loadAccount]];
};
