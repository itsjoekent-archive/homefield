/**
 * Return account properties based on API permissions.
 *
 * @param {Account} account
 * @param {Account} authorizer
 * @return {Object}
 */
module.exports = function transformAccount(account, authorizer) {
  const {
    _id,
    email,
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
    firstName,
    lastName,
    avatarUrl,
    twitterUrl,
    isBanned,
    createdAt,
  };

  if (!authorizer) {
    return base;
  }

  if (authorizer._id.toString() !== base.id) {
    return base;
  }

  return {
    ...base,
    campaigns,
  }
}
