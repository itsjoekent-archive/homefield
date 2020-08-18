const { promisify } = require('util');

const SocketError = require('../utils/SocketError');
const socketErrorHandler = require('../utils/socketErrorHandler');
const wrapAsyncFunction = require('../utils/wrapAsyncFunction');

module.exports = ({ io, socket, logger, redisClient }) => {
  async function standardRtcValidation(accountId) {
    if (!accountId) {
      throw new SocketError('Missing account id');
    }

    if (!socket.account) {
      throw new SocketError('Not authenticated');
    }

    if (!socket.activeCampaign) {
      throw new SocketError('No campaign specified for video chat');
    }

    if (!socket.activeVideoRoom) {
      throw new SocketError('Not connected to a video room');
    }

    const videoRoomParticipantsEncoded = await redisClient.hvals(`${socket.activeCampaign}-video-${socket.activeVideoRoom}`);
    const videoRoomParticipants = videoRoomParticipantsEncoded.map(JSON.parse);

    if (!videoRoomParticipants.find((participant) => participant.id === accountId)) {
      throw new SocketError('Attempted to connect with an account that is not in this video room');
    }

    const targetSocketId = await redisClient.get(`account-socket-${accountId}`);
    if (!targetSocketId) {
      throw new SocketError('Attempted to connect with an account that is not online');
    }

    return [targetSocketId];
  }

  async function onOffer(accountId, offer) {
    const [targetSocketId] = await standardRtcValidation(accountId);

    if (!offer) {
      throw new SocketError('Missing offer');
    }

    io.to(targetSocketId).emit(`rtc-offer-from-${socket.account._id.toString()}`, offer);
    logger.debug(`rtc offer made by account ${socket.account._id.toString()} to ${accountId}`);
  }

  socket.on('rtc-offer-sent', wrapAsyncFunction(onOffer, socketErrorHandler(socket, logger)));

  async function onAnswer(accountId, answer) {
    const [targetSocketId] = await standardRtcValidation(accountId);

    if (!answer) {
      throw new SocketError('Missing answer');
    }

    io.to(targetSocketId).emit(`rtc-answer-from-${socket.account._id.toString()}`, answer);
    logger.debug(`rtc answer made by account ${socket.account._id.toString()} to ${accountId}`);
  }

  socket.on('rtc-answer-sent', wrapAsyncFunction(onAnswer, socketErrorHandler(socket, logger)));

  async function onIceCandidate(accountId, candidate) {
    const [targetSocketId] = await standardRtcValidation(accountId);

    if (!candidate) {
      throw new SocketError('Missing candidate');
    }

    io.to(targetSocketId).emit(`rtc-ice-candidate-from-${socket.account._id.toString()}`, candidate);
    logger.debug(`rtc candidate made by account ${socket.account._id.toString()} to ${accountId}`);
  }

  socket.on('rtc-ice-candidate', wrapAsyncFunction(onIceCandidate, socketErrorHandler(socket, logger)));
}
