const { promisify } = require('util');

const mongo = require('mongodb');
const socketio = require('socket.io');
const redisAdapter = require('socket.io-redis');
const redis = require('redis');
const asyncRedis = require('async-redis');
const pino = require('pino');

const traceError = require('./utils/traceError');

const Account = require('../api/models/Account');
const Token = require('../api/models/Token');

const logger = pino({ name: 'platform-sockets', level: process.env.LOG_LEVEL });
const io = socketio();

(async function() {
  try {
    const { MONGODB_URL, REDIS_URL, PORT } = process.env;

    const mongoClient = await mongo.MongoClient.connect(MONGODB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    const mongoDb = mongoClient.db();

    const redisPublishClient = redis.createClient({ url: REDIS_URL });
    const redisSubscribeClient = redis.createClient({ url: REDIS_URL });
    const redisClient = asyncRedis.createClient({ url: REDIS_URL });

    io.adapter(redisAdapter({ pubClient: redisPublishClient, subClient: redisSubscribeClient }));

    redisPublishClient.on('error', (error) => {
      logger.error(error);
    });

    redisSubscribeClient.on('error', (error) => {
      logger.error(error);
    });

    redisClient.on('error', (error) => {
      logger.error(error);
    });

    io.use(async function(socket, next) {
      if (socket.token && socket.account) {
        return next();
      }

      try {
        const bearer = socket.handshake.query.bearer;

        const token = await Token(mongoDb).findTokenByBearer(bearer);

        if (token instanceof Error) {
          throw token;
        }

        if (!token) {
          socket.emit('ERROR', 'Invalid authentication token');
          return;
        }

        socket.token = token;

        const account = await Account(mongoDb).getAccountById(token.account);

        if (account instanceof Error) {
          throw account;
        }

        socket.account = account;

        const socketKey = `account-socket-${account._id.toString()}`;

        const existingSocketId = await redisClient.get(socketKey);
        if (existingSocketId) {
          const remoteDisconnect = promisify(io.of('/').adapter.remoteDisconnect);

          try {
            await remoteDisconnect(existingSocketId, true);
          } catch (error) {}
        }

        await redisClient.set(socketKey, socket.id);

        return next();
      } catch (error) {
        const [trace, errorId] = traceError(error);
        logger.error(trace);

        return next(new Error(`Authentication error with chat server. errorId=${errorId}`));
      }
    });

    io.on('connection', function(socket) {
      logger.debug(`socket connected, socket-id=${socket.id} ip=${socket.handshake.address} account-id=${socket.account._id.toString()}`);
      socket.isAuthenticated = false;

      const eventInitArguments = {
        io,
        socket,
        logger,
        mongoDb,
        redisClient,
      };

      socket.on('disconnect', async function() {
        logger.debug(`socket disconnected, socket-id=${socket.id} ip=${socket.handshake.address} account-id=${socket.account._id.toString()}`);
        await redisClient.del(`account-socket-${socket.account._id.toString()}`);
      });

      require('./events/join-campaign')(eventInitArguments);
      require('./events/rtc')(eventInitArguments);
      require('./events/video')(eventInitArguments);
      require('./events/chat')(eventInitArguments);
    });

    logger.info(`listening on port ${PORT}`);
    io.listen(PORT);
  } catch(error) {
    logger.error(error);
    process.exit(1);
  }
})();
