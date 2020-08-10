const SocketError = require('../utils/socketError');
const socketErrorHandler = require('../utils/socketErrorHandler');
const wrapAsyncFunction = require('../utils/wrapAsyncFunction');

module.exports = ({ socket, logger, mongoDb, redisClient }) => {
  async function onJoinCampaign(campaignId) {
    if (!campaignId) {
      throw new SocketError('Missing campaign id');
    }

    if (!socket.account) {
      throw new SocketError('Not authenticated');
    }

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
    socket.join(nextCampaignRoom);

    logger.debug(`${socket.account._id.toString()} joined ${nextCampaignRoom}`);
  }

  socket.on('join-campaign', wrapAsyncFunction(onJoinCampaign, socketErrorHandler(socket, logger)));
}
