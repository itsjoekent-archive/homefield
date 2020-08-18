/**
 * Return token properties based on API permissions.
 *
 * @param {Token} token
 * @param {Account} authorizer
 * @return {Object}
 */
module.exports = function transformToken(token, authorizer) {
  if (!token) {
    return null;
  }

  const {
    bearer,
    account,
    expiresAt,
  } = token;

  if (!authorizer || authorizer._id.toString() !== account.toString()) {
    return null;
  }

  return {
    bearer,
    expiresAt,
  };
}
