const PaginatedResponse = require('../utils/PaginatedResponse');
const wrapAsyncFunction = require('../utils/wrapAsyncFunction');
const endProcessOnFail = require('../utils/endProcessOnFail');

/**
 * Fields
 *
 * @param {ObjectID} _id Unique identifier
 * @param {ObjectID} account Account id
 * @param {ObjectID} campaign Campaign id
 * @param {String} type Activity type
 * @param {String} value Activity quantity
 * @param {Date} createdAt Time this activity was conducted
 */

 /**
  * Unique Indexes
  * _id
  *
  * Indexes
  * account, campaign, createdAt
  */

module.exports = function Activity(db) {
  const collection = db.collection('activity');

  async function init() {
    await collection.createIndex({ campaign: 1 });
    await collection.createIndex({ createdAt: 1 });
    await collection.createIndex({ account: 1 });
  }

  /**
   * Get paginated list of activity for the given account.
   *
   * @param {Account} account
   * @param {Number} [skip=0] Documents to skip
   * @param {Number} [limit=50] Max number of documents to retrieve.
   * @return {Promise<PaginatedResponse|Error>}
   */
  async function getPaginatedActivityForAccount(account, skip = 0, limit = 50) {
    const [result] = await collection.aggregate([
      { '$match': { account: account._id } },
      { '$sort': { createdAt: -1 } },
      {
        '$lookup': {
          from: 'accounts',
          localField: 'account',
          foreignField: '_id',
          as: 'account',
        },
      },
      {
        '$lookup': {
          from: 'campaigns',
          localField: 'campaign',
          foreignField: '_id',
          as: 'campaign',
        },
      },
      {
        '$facet': {
          meta: [
            { '$count': 'total' },
          ],
          data: [
            { '$skip': skip },
            { '$limit': limit },
          ],
        },
      },
    ]).toArray();

    const { meta, data } = result;

    return PaginatedResponse(meta[0] ? meta[0].total : 0, data);
  }

  /**
   * Get paginated list of activity for the given campaign.
   *
   * @param {Campaign} campaign
   * @param {Number} [skip=0] Documents to skip
   * @param {Number} [limit=50] Max number of documents to retrieve.
   * @return {Promise<PaginatedResponse|Error>}
   */
  async function getPaginatedActivityForCampaign(campaign, skip = 0, limit = 50) {
    const [result] = await collection.aggregate([
      { '$match': { campaign: campaign._id } },
      { '$sort': { createdAt: -1 } },
      {
        '$lookup': {
          from: 'accounts',
          localField: 'account',
          foreignField: '_id',
          as: 'account',
        },
      },
      {
        '$lookup': {
          from: 'campaigns',
          localField: 'campaign',
          foreignField: '_id',
          as: 'campaign',
        },
      },
      {
        '$facet': {
          meta: [
            { '$count': 'total' },
          ],
          data: [
            { '$skip': skip },
            { '$limit': limit },
          ],
        },
      },
    ]).toArray();

    const { meta, data } = result;

    return PaginatedResponse(meta[0] ? meta[0].total : 0, data);
  }

  /**
   * Create a new activity document for the given account and campaign.
   *
   * @param {Account} account
   * @param {Campaign} campaign
   * @param {String} type Activity type
   * @param {Number} value Activity value
   */
  async function createActivity(
    account,
    campaign,
    type,
    value,
  ) {
    const data = {
      account: account._id,
      campaign: campaign._id,
      type,
      value,
      createdAt: Date.now(),
    };

    const result = await collection.insertOne(data);

    return result.ops[0];
  }

  return {
    collection,

    init: wrapAsyncFunction(init, endProcessOnFail),
    getPaginatedActivityForAccount: wrapAsyncFunction(getPaginatedActivityForAccount),
    getPaginatedActivityForCampaign: wrapAsyncFunction(getPaginatedActivityForCampaign),
    createActivity: wrapAsyncFunction(createActivity),
  }
}
