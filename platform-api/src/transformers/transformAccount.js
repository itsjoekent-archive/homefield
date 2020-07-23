const transformCampaign = require('./transformCampaign');

/**
 * Return account properties based on API permissions.
 *
 * @param {Account} account
 * @param {Account} authorizer
 * @return {Object}
 */
module.exports = function transformAccount(account, authorizer) {
  if (!account) {
    return null;
  }

  const {
    _id,
    email,
    username,
    firstName,
    lastName,
    avatarUrl,
    twitterUrl,
    campaigns,
    isBanned,
    createdAt,
  } = account;

  const base = {
    id: _id.toString(),
    email,
    username,
    firstName,
    lastName,
    avatarUrl,
    twitterUrl,
    campaigns: campaigns.map((item) => {
      if (item._id) {
        return transformCampaign(item, authorizer);
      }

      return item.toString();
    }),
    isBanned,
    createdAt,
  };

  return base;
}
