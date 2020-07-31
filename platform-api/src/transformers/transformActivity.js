const transformAccount = require('./transformAccount');
const transformCampaign = require('./transformCampaign');

/**
 * Return account properties based on API permissions.
 *
 * @param {Activity} activity
 * @param {Account} authorizer
 * @return {Object}
 */
module.exports = function transformActivity(activity, authorizer) {
  if (!activity) {
    return null;
  }

  const {
    _id,
    account,
    campaign,
    type,
    value,
    createdAt,
  } = activity;

  const transformedAccount = Array.isArray(account)
    ? transformAccount(account[0], authorizer)
    : transformAccount(account);

  const transformedCampaign = Array.isArray(campaign)
    ? transformCampaign(campaign[0], authorizer)
    : transformCampaign(campaign, authorizer);

  return {
    id: _id.toString(),
    account: transformedAccount,
    campaign: transformedCampaign,
    type,
    value,
    createdAt,
  };
}
