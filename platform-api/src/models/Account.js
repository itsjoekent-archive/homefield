const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { ObjectID } = require('mongodb');
const { createCanvas } = require('canvas');
const { hashicon } = require('@emeraldpay/hashicon');

const PaginatedResponse = require('../utils/PaginatedResponse');
const wrapAsyncFunction = require('../utils/wrapAsyncFunction');
const endProcessOnFail = require('../utils/endProcessOnFail');
const { DEFAULT_USER_ROLE } = require('../utils/accountRoles');

/**
 * Fields
 *
 * @param {ObjectID} _id Unique identifier
 * @param {String} email Account email
 * @param {String} password Password hash (bcrypt)
 * @param {Date} lastAuthenticationUpdate Marker for comparing token validity
 * @param {String} firstName Account first name
 * @param {String} lastName Account last name
 * @param {String} avatarUrl Account avatar image url
 * @param {String} twitterUrl Twitter account that belongs to this account holder
 * @param {Array<String>} campaigns List of campaigns this account is volunteering for
 * @param {Boolean} isBanned Flag indicting if this account has been banned
 * @param {String} role Platform account role
 * @param {Date} createdAt Time this account was created
 * @param {Date} updatedAt Time this acount was last updated at
 */

/**
 * Unique Indexes
 * _id, email
 */

module.exports = function Account(db) {
  const collection = db.collection('accounts');

  /**
   * Initialize the collection on start.
   *
   * @return {Promise}
   */
  async function init() {
    await collection.createIndex({ email: 1 }, { unique: true });
  }

  /**
   * Get an account by its ID.
   *
   * @param {String} id Account id
   * @return {Promise<Account|Error>}
   */
  async function getAccountById(id) {
    const account = await collection.findOne({ _id: ObjectID(id) });

    return account;
  }

  /**
   * Get an account by its email.
   *
   * @param {String} email
   * @return {Promise<Account|Error>}
   */
  async function getAccountByEmail(email) {
    const account = await collection.findOne({ email });

    return account;
  }

  /**
   * Create a new account.
   *
   * @param {String} email Account email
   * @param {String} password Raw password
   * @param {String} firstName Account first name
   * @return {Promise<Account|Error>}
   */
  async function createAccount(email, password, firstName) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const avatarHash = crypto.createHash('md5').update(email).digest('hex');
    const avatarUrl = hashicon(avatarHash, { createCanvas, size: 128 }).toDataURL();

    const data = {
      email,
      password: hashedPassword,
      lastAuthenticationUpdate: Date.now(),
      firstName,
      lastName: null,
      avatarUrl,
      twitterUrl: null,
      campaigns: [],
      isBanned: false,
      role: DEFAULT_USER_ROLE,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await collection.insertOne(data);

    return result.ops[0];
  }

  /**
   * Delete an account.
   *
   * @param {String} id Account ID
   * @return {Promise<Boolean|Error>}
   */
  async function deleteAccount(id) {
    await collection.removeOne({ _id: ObjectID(id) });

    return true;
  }

  /**
   * Compare if the password matches the hashed bcrypt password
   * on the given account.
   *
   * @param {Account} account
   * @param {String} password
   * @param {Promise<Boolean|Error}
   */
  async function comparePassword(account, password) {
    const comparison = await bcrypt.compare(password, account.password);

    return comparison;
  }

  return {
    collection,

    init: wrapAsyncFunction(init, endProcessOnFail),
    getAccountById: wrapAsyncFunction(getAccountById),
    getAccountByEmail: wrapAsyncFunction(getAccountByEmail),
    createAccount: wrapAsyncFunction(createAccount),
    deleteAccount: wrapAsyncFunction(deleteAccount),
    comparePassword: wrapAsyncFunction(comparePassword),
  }
}
