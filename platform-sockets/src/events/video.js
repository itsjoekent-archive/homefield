const { promisify } = require('util');

const SocketError = require('../utils/socketError');
const socketErrorHandler = require('../utils/socketErrorHandler');
const wrapAsyncFunction = require('../utils/wrapAsyncFunction');

const transformAccount = require('../../lib/transformers/transformAccount');

module.exports = ({ io, socket, logger, redisPublishClient }) => {
  const hashSet = promisify(redisPublishClient.hset).bind(redisPublishClient);
  const hashGet = promisify(redisPublishClient.hget).bind(redisPublishClient);
  const hashDelete = promisify(redisPublishClient.hdel).bind(redisPublishClient);
  const hashGetAllValues = promisify(redisPublishClient.hvals).bind(redisPublishClient);

  function makeRoomHashKey(socket, room) {
    return `${socket.activeCampaign}-video-${room}`;
  }

  async function sync(hashKey, socket, room) {
    const videoRoomParticipantsEncoded = await hashGetAllValues(hashKey);
    const videoRoomParticipants = videoRoomParticipantsEncoded.map(JSON.parse);

    io.in(socket.activeCampaign).emit(`video-${room}-sync`, { videoRoomParticipants });
  }

  async function removeFromRoom(room, socket) {
    const removeFromHashKey = makeRoomHashKey(socket, room);
    await hashDelete(removeFromHashKey, socket.account._id.toString());

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

    if (socket.activeRoom) {
      await removeFromRoom(socket.activeRoom, socket);
    }

    socket.activeRoom = room;
    logger.debug(`account ${socket.account._id} joined ${room} in ${socket.activeCampaign}`);

    const value = JSON.stringify({
      ...transformAccount(socket.account, null),
      joinedRoomAt: Date.now(),
      isMicrophoneMuted: true,
      isCameraDisabled: true,
      isSpeakerMuted: false,
    });

    const hashKey = makeRoomHashKey(socket, room);
    await hashSet(hashKey, socket.account._id.toString(), value);
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

    if (!socket.activeRoom) {
      return;
    }

    await removeFromRoom(socket.activeRoom, socket);
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

    if (!socket.activeRoom) {
      throw new SocketError('Cannot push video update when not connected to a room');
    }

    const accountId = socket.account._id.toString();

    const hashKey = makeRoomHashKey(socket, socket.activeRoom);
    const record = await hashGet(hashKey, accountId);

    const value = JSON.stringify({
      ...(JSON.parse(record)),
      isMicrophoneMuted,
      isCameraDisabled,
      isSpeakerMuted,
    });

    await hashSet(hashKey, accountId, value);
    await sync(hashKey, socket, socket.activeRoom);
  }

  socket.on('video-room-status-update', wrapAsyncFunction(onVideoStatusUpdate, socketErrorHandler(socket, logger)));

  async function onDisconnect() {
    if (socket.account && socket.activeCampaign && socket.activeRoom) {
      await onVideoRoomLeave();
    }
  }

  socket.on('disconnect', wrapAsyncFunction(onDisconnect, socketErrorHandler(socket, logger)));
}
