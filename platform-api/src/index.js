const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const pino = require('pino-http');
const { MongoClient } = require('mongodb');

const setupDb = require('./setupDb');
const wrapAsyncFunction = require('./utils/wrapAsyncFunction');

(async function() {
  try {
    const { MONGODB_URL, PORT } = process.env;

    const app = express();
    const logger = pino();

    app.use(cors());

    const client = await MongoClient.connect(MONGODB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    const db = client.db();
    await setupDb(db);

    app.get('/files/:filename', require('./routes/get-file')(db));

    const router = express.Router();

    router.use(logger);
    router.use(express.json());

    router.use((req, res, next) => {
      req.db = db;
      next();
    });

    [
      require('./routes/get-campaigns'),
      require('./routes/get-campaign-by-id'),
      require('./routes/get-campaign-by-slug'),
      require('./routes/create-campaign'),
      require('./routes/delete-campaign'),

      require('./routes/get-campaign-activity'),
      require('./routes/get-account-activity'),

      require('./routes/volunteer'),
      require('./routes/stop-volunteering'),

      require('./routes/get-account-campaigns'),
      require('./routes/get-account-by-id'),
      require('./routes/get-account-by-username'),

      require('./routes/create-account'),
      require('./routes/edit-account'),
      require('./routes/edit-account-avatar'),
      require('./routes/edit-account-password'),
      require('./routes/login'),
      require('./routes/logout'),
      require('./routes/token-verify'),

      require('./routes/upload-file'),
    ].forEach((route) => {
      const [method, path, handler, middleware] = route(router);

      async function handlerWrapper(req, res) {
        function onError(error) {
          const errorId = crypto.randomBytes(64).toString('hex');

          if (!error.message) {
            error.message = '';
          }

          error.message += `\nerrorId=${errorId}`;

          req.log.error(error);

          res.status(500).json({
            error: `Unexpected server error, errorId=${errorId}`,
            errorId,
          });
        }

        await wrapAsyncFunction(handler, onError)(req, res);
      }

      const stack = [...(middleware || []), handlerWrapper];
      router[method](path, ...stack);
    });

    app.use('/v1', router);

    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
