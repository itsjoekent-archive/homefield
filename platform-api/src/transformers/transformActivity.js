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

  return {
    id: _id.toString(),
    account: transformAccount(account[0], authorizer),
    campaign: transformCampaign(campaign[0], authorizer),
    type,
    value,
    createdAt,
  };
}
