const { promisify } = require('util');
const crypto = require('crypto');
const ms = require('ms');

const wrapAsyncFunction = require('../utils/wrapAsyncFunction');
const endProcessOnFail = require('../utils/endProcessOnFail');

const randomBytes = promisify(crypto.randomBytes);

/**
 * Fields
 *
 * @param {ObjectID} _id Unique identifier
 * @param {String} bearer Bearer token
 * @param {String} account Account ID this token relates to
 * @param {Date} lauPoint Last authentication update value when this token was created
 * @param {Date} createdAt Time this token was created
 */

/**
 * Unique indexes
 * _id, bearer
 */

module.exports = (db) => {
  const collection = db.collection('tokens');

  /**
   * Initialize the collection on start.
   *
   * @return {Promise}
   */

  async function init() {
    await collection.createIndex({ bearer: 1 }, { unique: true });
    await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  }

  /**
   * Create a new token for the given account.
   *
   * @param {Account} account
   * @return {Promise<Token|Error>}
   */
  async function createToken(account) {
    const bearerValue = await randomBytes(32);
    const bearer = crypto.createHash('md5').update(`${bearerValue}-${Date.now()}`).digest('hex');

    const data = {
      bearer,
      account: account._id.toString(),
      lauPoint: account.lastAuthenticationUpdate,
      createdAt: Date.now(),
      expiresAt: Date.now() + ms('30 days'),
    };

    const result = await collection.insertOne(data);

    return result.ops[0];
  }

  /**
   * Find a token by the bearer value.
   *
   * @param {String} bearer
   * @return {Promise<Token|Error>}
   */
  async function findTokenByBearer(bearer) {
    const token = await collection.findOne({ bearer });

    if (!token) {
      return null;
    }

    if (token.expiresAt < Date.now()) {
      return null;
    }

    return token;
  }

  return {
    collection,
    
    init: wrapAsyncFunction(init, endProcessOnFail),
    createToken: wrapAsyncFunction(createToken),
    findTokenByBearer: wrapAsyncFunction(findTokenByBearer),
  }
}
