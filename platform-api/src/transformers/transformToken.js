/**
 * Return token properties based on API permissions.
 *
 * @param {Token} token
 * @param {Account} authorizer
 * @return {Object}
 */
module.exports = function transformToken(token, authorizer) {
  const {
    bearer,
    account,
    expiresAt,
  } = token;

  if (!authorizer || authorizer._id.toString() !== account) {
    return null;
  }

  return {
    bearer,
    expiresAt,
  };
}
