const ms = require('ms');

const PaginatedResponse = require('../utils/PaginatedResponse');
const wrapAsyncFunction = require('../utils/wrapAsyncFunction');
const endProcessOnFail = require('../utils/endProcessOnFail');

/**
 * Fields
 *
 * @param {ObjectID} _id Unique identifier
 * @param {ObjectID} from Account ID that created this message
 * @param {ObjectID} campaign Campaign ID this message belongs too
 * @param {String} channel Chaat channel this message belongs too
 * @param {String} text Message text
 * @param {Date} createdAt Date this message was created
 */

 /**
  * Unique indexes
  * _id
  *
  * Compound Indexes
  * campaign:channel
  *
  * Indexes
  * createdAt
  */

module.exports = function ChatMessage(db) {
  const collection = db.collection('chatMessages');

  /**
   * Initialize the collection on start.
   */
  async function init() {
    await collection.createIndex({ campaign: 1, channel: 1 });
    await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: ms('30 days') / 1000 });
  }

  /**
   * Get a paginated list of chat messages for the given campaign chat channel.
   *
   * @param {Campaign} campaign
   * @param {String} channel
   * @param {Number} [skip=0] Documents to skip
   * @param {Number} [limit=50] Max number of documents to retrieve
   * @return {Promise<PaginatedResponse|Error>}
   */
  async function getPaginatedChatMessages(campaign, channel, skip = 0, limit = 50) {
    const [result] = await collection.aggregate([
      { '$match': { campaign: campaign._id, channel } },
      { '$sort': { createdAt: -1 } },
      {
        '$lookup': {
          from: 'accounts',
          localField: 'from',
          foreignField: '_id',
          as: 'from',
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
   * Create a new chat message document for the given campaign channel.
   *
   * @param {Account} from
   * @param {Campaign} campaign
   * @param {String} channel
   * @param {String} text
   */
  async function createChatMessage(
    from,
    campaign,
    channel,
    text,
  ) {
    const data = {
      from: from._id,
      campaign: campaign._id,
      channel,
      text,
      createdAt: Date.now(),
    };

    const result = await collection.insertOne(data);

    return result.ops[0];
  }

  return {
    collection,

    init: wrapAsyncFunction(init, endProcessOnFail),
    getPaginatedChatMessages: wrapAsyncFunction(getPaginatedChatMessages),
    createChatMessage: wrapAsyncFunction(createChatMessage),
  }
}
