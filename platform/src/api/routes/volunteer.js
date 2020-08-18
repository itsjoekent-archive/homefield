const { ObjectID } = require('mongodb');

const Account = require('../models/Account');
const Activity = require('../models/Activity');
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

    const campaign = await Campaign(db).getCampaignById(ObjectID(campaignId));

    if (campaign instanceof Error) {
      throw campaign;
    }

    if (!campaign) {
      res.status(404).json({ error: 'This campaign does not exist' });
      return;
    }

    const { firewall } = campaign;
    const currentCampaignIds = account.campaigns.map((id) => id.toString());

    if (currentCampaignIds.find((compareId) => compareId === campaignId)) {
      res.json({
        data: {
          account: transformAccount(account, account),
          campaign: transformCampaign(campaign, account),
        },
      });

      return;
    }

    const conflicts = firewall && firewall.filter((firewalledCampaignId) => (
      currentCampaignIds.includes(firewalledCampaignId.toString())
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

          return `"${conflictedCampaign.name}, ${conflictedCampaign.location}"`;
        })
        .filter((name) => !!name)
        .join(', ');

      res.status(451).json({
        error: `You are cannot volunteer for "${campaign.name}, ${campaign.location}" while volunteering for ${conflictedCampaignNames}`,
      });

      return;
    }

    const activityResult = await Activity(db).createActivity(
      account,
      campaign,
      'joined',
      null,
    );

    if (activityResult instanceof Error) {
      throw activityResult;
    }

    const { value: updatedAccount } = await Account(db).collection.findOneAndUpdate(
      { _id: account._id },
      { '$push': { campaigns: campaign._id } },
      { returnOriginal: false },
    );

    res.json({
      data: {
        account: transformAccount(updatedAccount, account),
        campaign: transformCampaign(campaign, account),
      },
    });
  }

  return ['post', '/campaigns/:campaignId/volunteer', handler, [loadAccount]];
};
