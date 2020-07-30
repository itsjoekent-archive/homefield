const bcrypt = require('bcrypt');
const crypto = require('crypto');
const ms = require('ms');
const { promisify } = require('util');
const { createCanvas } = require('canvas');
const { hashicon } = require('@emeraldpay/hashicon');

const randomBytes = promisify(crypto.randomBytes);

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
 * @param {String} username Account username
 * @param {String} firstName Account first name
 * @param {String} lastName Account last name
 * @param {String} avatarUrl Account avatar image url
 * @param {String} bio Account bio
 * @param {String} twitterUsername Twitter account that belongs to this account holder
 * @param {Array<String>} campaigns List of campaigns this account is volunteering for
 * @param {Boolean} isBanned Flag indicting if this account has been banned
 * @param {String} role Platform account role
 * @param {String} resetToken Random token used when resetting auth credentials for this account
 * @param {Date} resetTokenExpiration Time the reset token has expired
 * @param {Date} createdAt Time this account was created
 * @param {Date} updatedAt Time this acount was last updated at
 */

/**
 * Unique Indexes
 * _id, email, username
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
    await collection.createIndex({ username: 1 }, { unique: true });
  }

  /**
   * Get an account by its ID.
   *
   * @param {ObjectID} _id Account id
   * @return {Promise<Account|Error>}
   */
  async function getAccountById(_id) {
    const account = await collection.findOne({ _id });

    return account;
  }

  /**
   * Get an account by its email.
   *
   * @param {String} email
   * @return {Promise<Account|Error>}
   */
  async function getAccountByEmail(email) {
    const account = await collection.findOne({ email: email.toLowerCase().trim() });

    return account;
  }

  /**
   * Get an account by its username.
   *
   * @param {String} username
   * @return {Promise<Account|Error>}
   */
  async function getAccountByUsername(username) {
    const account = await collection.findOne({ username });

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
    const avatarHasicon = hashicon(avatarHash, { createCanvas, size: 512 });

    const avatarCanvas = createCanvas(256, 256);
    const ctx = avatarCanvas.getContext('2d');

    ctx.drawImage(avatarHasicon, 128, 128, 256, 256, 0, 0, 256, 256);

    const avatarUrl = avatarCanvas.toDataURL();

    const createdAt = Date.now();
    const username = encodeURIComponent(`${firstName.replace(/ /g, '')}-${createdAt.toString().slice(Math.round(createdAt.toString().length / 2))}`.toLowerCase());

    const data = {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      lastAuthenticationUpdate: Date.now(),
      username,
      firstName,
      lastName: null,
      avatarUrl,
      bio: null,
      twitterUsername: null,
      campaigns: [],
      isBanned: false,
      role: DEFAULT_USER_ROLE,
      resetToken: null,
      resetTokenExpiration: null,
      createdAt: createdAt,
      updatedAt: createdAt,
    };

    const result = await collection.insertOne(data);

    return result.ops[0];
  }

  /**
   * Delete an account.
   *
   * @param {ObjectID} id Account ID
   * @return {Promise<Boolean|Error>}
   */
  async function deleteAccount(_id) {
    await collection.removeOne({ _id });

    return true;
  }

  /**
   * Compare if the password matches the hashed bcrypt password
   * on the given account.
   *
   * @param {Account} account
   * @param {String} password
   * @return {Promise<Boolean|Error}
   */
  async function comparePassword(account, password) {
    const comparison = await bcrypt.compare(password, account.password);

    return comparison;
  }

  /**
   * Hash a password with bcrypt.
   *
   * @param {String} password
   * @return {Promise<String|Error>}
   */
  async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 10);

    return hashedPassword;
  }

  /**
   * Generate a reset token for this account.
   *
   * @param {Account} account
   * @return {Promise<[Account,String]|Error>}
   */
  async function generateResetToken(account) {
    const resetTokenBuffer = await randomBytes(16);
    const resetToken = resetTokenBuffer.toString('hex');

    const resetTokenHashed = await hashPassword(resetToken);

    if (resetTokenHashed instanceof Error) {
      return resetTokenHashed;
    }

    const { value: updatedAccount } = await collection.findOneAndUpdate(
      { _id: account._id },
      {
        '$set': {
          resetToken: resetTokenHashed,
          resetTokenExpiration: Date.now() + ms('2 hours'),
        },
      },
      { returnOriginal: false },
    );

    return [resetToken, updatedAccount];
  }

  /**
   * Compare the reset tokens and if the reset token has expired.
   *
   * @param {Account} account
   * @param {String} resetToken
   * @return {Promise<Boolean|Error>}
   */
  async function checkResetToken(account, resetToken) {
    const comparison = await bcrypt.compare(resetToken, account.resetToken);
    const hasResetTokenExpired = comparison.resetTokenExpiration && comparison.resetTokenExpiration < Date.now();

    return comparison && !hasResetTokenExpired;
  }

  return {
    collection,

    init: wrapAsyncFunction(init, endProcessOnFail),
    getAccountById: wrapAsyncFunction(getAccountById),
    getAccountByEmail: wrapAsyncFunction(getAccountByEmail),
    getAccountByUsername: wrapAsyncFunction(getAccountByUsername),
    createAccount: wrapAsyncFunction(createAccount),
    deleteAccount: wrapAsyncFunction(deleteAccount),
    comparePassword: wrapAsyncFunction(comparePassword),
    hashPassword: wrapAsyncFunction(hashPassword),
    generateResetToken: wrapAsyncFunction(generateResetToken),
    checkResetToken: wrapAsyncFunction(checkResetToken),
  }
}
