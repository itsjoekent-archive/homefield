const { ObjectID } = require('mongodb');

const SocketError = require('../utils/SocketError');
const socketErrorHandler = require('../utils/socketErrorHandler');
const wrapAsyncFunction = require('../utils/wrapAsyncFunction');

const Account = require('../../api/models/Account');
const Campaign = require('../../api/models/Campaign');

module.exports = ({ socket, logger, mongoDb, redisClient }) => {
  async function onJoinCampaign(campaignId) {
    if (!campaignId) {
      throw new SocketError('Missing campaign id');
    }

    if (!socket.account) {
      throw new SocketError('Not authenticated');
    }

    // Fetch most up-to-date campaign list before doing validation
    const account = await Account(mongoDb).getAccountById(socket.account._id);
    socket.account = account;

    if (!socket.account.campaigns.map((id) => id.toString()).includes(campaignId)) {
      throw new SocketError('Cannot join chat room for a campaign you\'re not volunteering for');
    }

    const nextCampaignRoom = `campaign-${campaignId}`;

    if (socket.activeCampaign === nextCampaignRoom) {
      return;
    }

    if (socket.activeCampaign && Object.keys(socket.rooms).includes(socket.activeCampaign)) {
      socket.leave(socket.activeCampaign);
      logger.debug(`${socket.account._id.toString()} left ${socket.activeCampaign}`);
    }

    socket.activeCampaign = nextCampaignRoom;
    socket.activeCampaignData = await Campaign(mongoDb).getCampaignById(ObjectID(campaignId));

    socket.join(nextCampaignRoom);

    logger.debug(`${socket.account._id.toString()} joined ${nextCampaignRoom}`);
  }

  socket.on('join-campaign', wrapAsyncFunction(onJoinCampaign, socketErrorHandler(socket, logger)));
}
