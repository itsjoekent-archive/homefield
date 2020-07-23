const PaginatedResponse = require('../utils/PaginatedResponse');
const wrapAsyncFunction = require('../utils/wrapAsyncFunction');
const endProcessOnFail = require('../utils/endProcessOnFail');

/**
 * Fields
 *
 * @param {ObjectID} _id Unique identifier
 * @param {String} name Campaign name
 * @param {String} logoUrl URL representing the campaign logo
 * @param {String} location Location this campaign is taking place
 * @param {Array<ObjectID>} admins Account IDs that have full permissions over this campaign
 * @param {Array<ObjectID>} staff Account IDs that have staff permissions over this campaign
 * @param {Array<ObjectID>} moderators Account IDs that have moderator permissions over this campaign
 * @param {Array<ObjectID>} blocked Account IDs that are blocked from interacting with this campaign
 * @param {Array<ObjectID>} firewall Campaign IDs that volunteers cannot participate in if they are volunteering with this campaigns
 * @param {String} dialer.iframe URL of the iframe to embed for the dialer tool
 * @param {String} sms.iframe URL of the iframe to embed for the SMS tool
 * @param {String} wiki Markdown content for volunteer resources
 * @param {Array<String>} chat.channels Chat channel IDs that belong to this campaign
 * @param {Array<Object>} chat.customEmojis Custom chat emojis in this campaign
 * @param {String} chat.customEmojis[].symbol Unique symbol for this emoji
 * @param {String} chat.customEmojis[].fileUrl Url that references the emoji image
 * @param {Boolean} isPublic Flag indicting if volunteers can sign up for this campaign
 * @param {Date} createdAt Time the campaign was created
 * @param {Date} updatedAt Time the campaign was last updated
 */

/**
 * Unique Indexes
 * _id
 *
 * Indexes
 * name, createdAt, isPublic
 */

module.exports = function(db) {
  const collection = db.collection('campaigns');

  /**
   * Initialize the collection on start.
   *
   * @return {Promise}
   */
  async function init() {
    await collection.createIndex({ createdAt: 1 });
    await collection.createIndex({ isPublic: 1 });
    await collection.createIndex({ name: 1 });
  }

  /**
   * Get a single campaign
   *
   * @param {ObjectID} _id Campaign id
   * @return {Promise<Campaign|Error>}
   */
  async function getCampaignById(_id) {
    const campaign = await collection.findOne({ _id });

    return campaign;
  }

  const SORT_CAMPAIGNS_ALPHABETICAL = { name: 1 };
  const SORT_CAMPAIGNS_REVERSE_ALPHABETICAL = { name: -1 };
  const SORT_CAMPAIGNS_NEWEST = { createdAt: 1 };
  const SORT_CAMPAIGNS_OLDEST = { createdAt: -1 };

  /**
   * Get a paginated list of campaigns.
   *
   * @param {Object} [sort=SORT_CAMPAIGNS_ALPHABETICAL] Sort field & direction
   * @param {Number} [skip=0] Documents to skip
   * @param {Number} [limit=50] Max number of documents to retrieve
   * @param {Boolean} [isPublic=true] Filter out campaigns based on their status
   * @return {Promise<PaginatedResponse|Error>} Returns a Promise with a PaginatedResponse or an error
   */
  async function getPaginatedCampaigns(
    sort = SORT_CAMPAIGNS_ALPHABETICAL,
    skip = 0,
    limit = 50,
    isPublic = true,
  ) {
    const [result] = await collection.aggregate([
      { '$match': { isPublic } },
      { '$sort': sort },
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
   * Create a new campaign.
   *
   * @param {String} name The name of the campaign
   * @param {String} location The location of the campaign
   * @param {String} logoUrl The URL of the logo
   * @return {Promise<Campaign|Error>} The newly created campaign.
   */
  async function createCampaign(
    name,
    location,
    logoUrl,
  ) {
    const data = {
      name,
      location,
      logoUrl,
      admins: [],
      staff: [],
      moderators: [],
      blocked: [],
      firewall: [],
      dialer: {
        iframe: null,
      },
      sms: {
        iframe: null,
      },
      wiki: null,
      chat: {
        channels: [],
        customEmojis: [],
      },
      isPublic: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await collection.insertOne(data);

    return result.ops[0];
  }

  /**
   * Delete a campaign from the database.
   *
   * @param {ObjectID} _id Campaign id
   * @return {Promise<Boolean|Error>}
   */
  async function deleteCampaign(_id) {
    const deletionResult = await collection.removeOne({ _id });

    return deletionResult;
  }

  return {
    SORT_CAMPAIGNS_ALPHABETICAL,
    SORT_CAMPAIGNS_REVERSE_ALPHABETICAL,
    SORT_CAMPAIGNS_NEWEST,
    SORT_CAMPAIGNS_OLDEST,

    collection,

    init: wrapAsyncFunction(init, endProcessOnFail),
    getCampaignById: wrapAsyncFunction(getCampaignById),
    getPaginatedCampaigns: wrapAsyncFunction(getPaginatedCampaigns),
    createCampaign: wrapAsyncFunction(createCampaign),
    deleteCampaign: wrapAsyncFunction(deleteCampaign),
  };
}
