/**
 * Return campaign properties based on API permissions.
 *
 * @param {Campaign} campaign
 * @param {Account} authorizer
 * @return {Object}
 */
module.exports = function transformCampaign(campaign, authorizer) {
  if (!campaign) {
    return null;
  }

  const {
    _id,
    name,
    logoUrl,
    location,
    owner,
    staff,
    moderators,
    blocked,
    firewall,
    dialer,
    sms,
    wiki,
    chat,
    isPublic,
    createdAt,
    updatedAt,
  } = campaign;

  const base = {
    id: _id.toString(),
    name,
    logoUrl,
    location,
    dialer,
    sms,
    wiki,
    chat,
    isPublic,
    createdAt,
    updatedAt,
  };

  if (!authorizer) {
    return base;
  }

  return base;
}
