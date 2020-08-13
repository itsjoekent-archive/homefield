const { promisify } = require('util');
const { ObjectID } = require('mongodb');

const SocketError = require('../utils/socketError');
const socketErrorHandler = require('../utils/socketErrorHandler');
const wrapAsyncFunction = require('../utils/wrapAsyncFunction');

const Campaign = require('../../lib/models/Campaign');
const transformAccount = require('../../lib/transformers/transformAccount');

module.exports = ({ io, socket, logger, redisPublishClient, mongoDb }) => {
  const hashSet = promisify(redisPublishClient.hset).bind(redisPublishClient);
  const hashDelete = promisify(redisPublishClient.hdel).bind(redisPublishClient);
  const hashGetAllValues = promisify(redisPublishClient.hvals).bind(redisPublishClient);

  async function sync() {
    const chatRoomParticipantsEncoded = await hashGetAllValues(socket.activeChatRoom);
    const chatRoomParticipants = chatRoomParticipantsEncoded.map(JSON.parse);

    io.in(socket.activeChatRoom).emit('chat-participants-sync', chatRoomParticipants);
  }

  async function onJoinChat(chatRoom) {
    if (!chatRoom) {
      throw new SocketError('Missing chat room');
    }

    if (!socket.account) {
      throw new SocketError('Not authenticated');
    }

    if (!socket.activeCampaign) {
      throw new SocketError('No campaign specified for chat');
    }

    if (socket.activeChatRoom) {
      await hashDelete(socket.activeChatRoom, socket.account._id.toString());

      socket.leave(socket.activeChatRoom);

      await sync();
    }

    const nextChatRoom = `${socket.activeCampaign}-chat-${chatRoom}`;
    logger.debug(`${socket.account._id.toString()} joined ${nextChatRoom}`);

    socket.activeChatRoom = nextChatRoom;
    socket.join(socket.activeChatRoom);

    const value = JSON.stringify(transformAccount(socket.account, null));
    const output = await hashSet(socket.activeChatRoom, socket.account._id.toString(), value);

    await sync();

    // TODO: Send all prior messages to the joining client
  }

  socket.on('join-chat', wrapAsyncFunction(onJoinChat, socketErrorHandler(socket, logger)));

  async function onOutgoingChatMessage(messageText) {
    if (!messageText) {
      throw new SocketError('Missing message text');
    }

    if (!socket.account) {
      throw new SocketError('Not authenticated');
    }

    if (!socket.activeCampaign) {
      throw new SocketError('No campaign specified for the message');
    }

    if (!socket.activeChatRoom) {
      throw new SocketError('No chat room specified for the message');
    }

    logger.debug(`${socket.account._id.toString()} sent message to ${socket.activeChatRoom}`);

    // TEMPORARY...
    io.in(socket.activeChatRoom).emit('incoming-chat-messages', [{
      id: Math.round(Math.random() * 1000000),
      account: transformAccount(socket.account, null),
      text: messageText,
      room: socket.activeChatRoom.replace(`${socket.activeCampaign}-chat-`, ''),
      createdAt: Date.now(),
    }]);
  }

  socket.on('outgoing-chat-message', wrapAsyncFunction(onOutgoingChatMessage, socketErrorHandler(socket, logger)));

  async function onDisconnect() {
    if (socket.account && socket.activeCampaign && socket.activeChatRoom) {
      await hashDelete(socket.activeChatRoom, socket.account._id.toString());
      await sync();
    }
  }

  socket.on('disconnect', wrapAsyncFunction(onDisconnect, socketErrorHandler(socket, logger)));

  async function onAllChatRoomCounts() {
    if (!socket.account) {
      throw new SocketError('Not authenticated');
    }

    if (!socket.activeCampaign) {
      throw new SocketError('No campaign specified for the message');
    }

    const campaignId = ObjectID(socket.activeCampaign.replace('campaign-', ''));
    const campaign = await Campaign(mongoDb).getCampaignById(campaignId);

    const roomNames = campaign.chatChannels.map((room) => room.title);

    const roomsEncoded = await Promise.all(roomNames.map((title) => {
      const hashKey = `${socket.activeCampaign}-chat-${title}`;
      return hashGetAllValues(hashKey);
    }));

    const data = roomsEncoded.reduce((acc, participants, index) => ({
      ...acc,
      [roomNames[index]]: participants.length,
    }), {});

    socket.emit('all-chat-room-counts', data);
  }

  socket.on('get-all-chat-room-counts', wrapAsyncFunction(onAllChatRoomCounts, socketErrorHandler(socket, logger)));
}
