const transformAccount = require('./transformAccount');
const transformCampaign = require('./transformCampaign');

/**
 * Return chat message properties based on API permissions.
 *
 * @param {ChatMessage} chatMessage
 * @param {Account} authorizer
 * @return {Object}
 */
module.exports = function transformChatMessage(chatMessage, authorizer) {
  if (!chatMessage) {
    return null;
  }

  const {
    _id,
    from,
    campaign,
    channel,
    text,
    createdAt,
  } = chatMessage;

  let transformedAccount = null;

  if (Array.isArray(from)) {
    transformedAccount = transformAccount(from[0], authorizer)
  } else if (typeof from === 'object' && from._id) {
    transformedAccount = transformAccount(from, authorizer);
  } else if (from) {
    transformedAccount = from.toString();
  }

  let transformedCampaign = null;

  if (Array.isArray(campaign)) {
    transformedCampaign = transformCampaign(campaign[0], authorizer);
  } else if (typeof campaign === 'object' && campaign._id) {
    transformedCampaign = transformCampaign(campaign, authorizer);
  } else if (campaign) {
    transformedCampaign = campaign.toString();
  }

  return {
    id: _id.toString(),
    from: transformedAccount,
    campaign: transformedCampaign,
    channel,
    text,
    createdAt,
  };
}
