const { promisify } = require('util');
const { ObjectID } = require('mongodb');

const SocketError = require('../utils/socketError');
const socketErrorHandler = require('../utils/socketErrorHandler');
const wrapAsyncFunction = require('../utils/wrapAsyncFunction');

const Campaign = require('../../api/models/Campaign');
const transformAccount = require('../../api/transformers/transformAccount');

module.exports = ({ io, socket, logger, redisClient, mongoDb }) => {
  function makeRoomHashKey(socket, room) {
    return `${socket.activeCampaign}-video-${room}`;
  }

  async function sync(hashKey, socket, room) {
    const videoRoomParticipantsEncoded = await redisClient.hvals(hashKey);
    const videoRoomParticipants = videoRoomParticipantsEncoded.map(JSON.parse);

    io.in(socket.activeCampaign).emit(`video-${room}-sync`, { videoRoomParticipants });
  }

  async function removeFromRoom(room, socket) {
    const removeFromHashKey = makeRoomHashKey(socket, room);
    await redisClient.hdel(removeFromHashKey, socket.account._id.toString());

    logger.debug(`account ${socket.account._id} left ${room} in ${socket.activeCampaign}`);
    await sync(removeFromHashKey, socket, room);
  }

  async function onVideoRoomJoin(room) {
    if (!room) {
      throw new SocketError('Missing video stream room');
    }

    if (!socket.account) {
      throw new SocketError('Not authenticated');
    }

    if (!socket.activeCampaign) {
      throw new SocketError('No campaign specified for video chat');
    }

    if (socket.activeVideoRoom) {
      await removeFromRoom(socket.activeVideoRoom, socket);
    }

    socket.activeVideoRoom = room;
    logger.debug(`account ${socket.account._id} joined ${room} in ${socket.activeCampaign}`);

    const value = JSON.stringify({
      ...transformAccount(socket.account, null),
      joinedRoomAt: Date.now(),
      isMicrophoneMuted: true,
      isCameraDisabled: true,
      isSpeakerMuted: false,
    });

    const hashKey = makeRoomHashKey(socket, room);
    await redisClient.hset(hashKey, socket.account._id.toString(), value);
    await sync(hashKey, socket, room);
  }

  socket.on('join-video-room', wrapAsyncFunction(onVideoRoomJoin, socketErrorHandler(socket, logger)));

  async function onVideoRoomLeave() {
    if (!socket.account) {
      throw new SocketError('Not authenticated');
    }

    if (!socket.activeCampaign) {
      return;
    }

    if (!socket.activeVideoRoom) {
      return;
    }

    await removeFromRoom(socket.activeVideoRoom, socket);
  }

  socket.on('leave-video-room', wrapAsyncFunction(onVideoRoomLeave, socketErrorHandler(socket, logger)));

  async function onVideoStatusUpdate(isMicrophoneMuted, isCameraDisabled, isSpeakerMuted) {
    if (typeof isMicrophoneMuted !== 'boolean') {
      throw new SocketError('Missing microphone status');
    }

    if (typeof isCameraDisabled !== 'boolean') {
      throw new SocketError('Missing video status');
    }

    if (typeof isSpeakerMuted !== 'boolean') {
      throw new SocketError('Missing speaker status');
    }

    if (!socket.account) {
      throw new SocketError('Not authenticated');
    }

    if (!socket.activeCampaign) {
      throw new SocketError('No campaign specified for video chat');
    }

    if (!socket.activeVideoRoom) {
      throw new SocketError('Cannot push video update when not connected to a room');
    }

    const accountId = socket.account._id.toString();

    const hashKey = makeRoomHashKey(socket, socket.activeVideoRoom);
    const record = await redisClient.hget(hashKey, accountId);

    const value = JSON.stringify({
      ...(JSON.parse(record)),
      isMicrophoneMuted,
      isCameraDisabled,
      isSpeakerMuted,
    });

    await redisClient.hset(hashKey, accountId, value);
    await sync(hashKey, socket, socket.activeVideoRoom);
  }

  socket.on('video-room-status-update', wrapAsyncFunction(onVideoStatusUpdate, socketErrorHandler(socket, logger)));

  async function onDisconnect() {
    if (socket.account && socket.activeCampaign && socket.activeVideoRoom) {
      await onVideoRoomLeave();
    }
  }

  socket.on('disconnect', wrapAsyncFunction(onDisconnect, socketErrorHandler(socket, logger)));

  async function allVideoRooms() {
    if (!socket.account) {
      throw new SocketError('Not authenticated');
    }

    if (!socket.activeCampaign) {
      throw new SocketError('No campaign specified for video chat');
    }

    const campaignId = ObjectID(socket.activeCampaign.replace('campaign-', ''));
    const campaign = await Campaign(mongoDb).getCampaignById(campaignId);

    const roomNames = campaign.videoRooms.map((room) => room.title);

    const roomsEncoded = await Promise.all(roomNames.map((title) => {
      const hashKey = makeRoomHashKey(socket, title);
      return redisClient.hvals(hashKey);
    }));

    const data = roomsEncoded.reduce((acc, participants, index) => ({
      ...acc,
      [roomNames[index]]: participants.map(JSON.parse),
    }), {});

    socket.emit('all-video-rooms-data', data);
  }

  socket.on('all-video-rooms', wrapAsyncFunction(allVideoRooms, socketErrorHandler(socket, logger)))
}
