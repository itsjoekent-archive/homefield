module.exports = function transformCampaign(campaign, user) {
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

  if (!user) {
    return base;
  }

  return campaign;
}
