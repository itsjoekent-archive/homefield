const { promisify } = require('util');
const { ObjectID } = require('mongodb');

const SocketError = require('../utils/SocketError');
const socketErrorHandler = require('../utils/socketErrorHandler');
const wrapAsyncFunction = require('../utils/wrapAsyncFunction');

const Campaign = require('../../api/models/Campaign');
const ChatMessage = require('../../api/models/ChatMessage');
const transformAccount = require('../../api/transformers/transformAccount');
const transformChatMessage = require('../../api/transformers/transformChatMessage');

module.exports = ({ io, socket, logger, redisClient, mongoDb }) => {
  async function sync() {
    const chatRoomParticipantsEncoded = await redisClient.hvals(socket.activeChatRoom);
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
      await redisClient.hdel(socket.activeChatRoom, socket.account._id.toString());

      socket.leave(socket.activeChatRoom);

      await sync();
    }

    const nextChatRoom = `${socket.activeCampaign}-chat-${chatRoom}`;
    logger.debug(`${socket.account._id.toString()} joined ${nextChatRoom}`);

    socket.activeChatRoom = nextChatRoom;
    socket.chatChannelName = chatRoom;

    socket.join(socket.activeChatRoom);

    const value = JSON.stringify(transformAccount(socket.account, null));
    const output = await redisClient.hset(socket.activeChatRoom, socket.account._id.toString(), value);

    await sync();

    const previousChatMessages = await ChatMessage(mongoDb).getPaginatedChatMessages(
      socket.activeCampaignData,
      socket.chatChannelName,
    );

    if (previousChatMessages && previousChatMessages.data) {
      const previousChatMessagesTransformed = previousChatMessages.data
        .map((chatMessage) => transformChatMessage(chatMessage, null));

      socket.emit('incoming-chat-messages', previousChatMessagesTransformed);
    }
  }

  socket.on('join-chat', wrapAsyncFunction(onJoinChat, socketErrorHandler(socket, logger)));

  async function onOutgoingChatMessage(messageText) {
    if (!messageText) {
      throw new SocketError('Missing message text');
    }

    if (!socket.account) {
      throw new SocketError('Not authenticated');
    }

    if (!socket.activeCampaign || !socket.activeCampaignData) {
      throw new SocketError('No campaign specified for the message');
    }

    if (!socket.activeChatRoom || !socket.chatChannelName) {
      throw new SocketError('No chat room specified for the message');
    }

    const message = await ChatMessage(mongoDb).createChatMessage(
      socket.account,
      socket.activeCampaignData,
      socket.chatChannelName,
      messageText,
    );

    const outgoingMessage = {
      ...transformChatMessage(message, null),
      from: transformAccount(socket.account, null),
    };

    io.in(socket.activeChatRoom).emit('incoming-chat-messages', [outgoingMessage]);

    logger.debug(`${socket.account._id.toString()} sent message to ${socket.activeChatRoom}`);
  }

  socket.on('outgoing-chat-message', wrapAsyncFunction(onOutgoingChatMessage, socketErrorHandler(socket, logger)));

  async function onDisconnect() {
    if (socket.account && socket.activeCampaign && socket.activeChatRoom) {
      await redisClient.hdel(socket.activeChatRoom, socket.account._id.toString());
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
      return redisClient.hvals(hashKey);
    }));

    const data = roomsEncoded.reduce((acc, participants, index) => ({
      ...acc,
      [roomNames[index]]: participants.length,
    }), {});

    socket.emit('all-chat-room-counts', data);
  }

  socket.on('get-all-chat-room-counts', wrapAsyncFunction(onAllChatRoomCounts, socketErrorHandler(socket, logger)));
}
