const logger = require('./logger');

module.exports = async function setupDb(db) {
  try {
    await Promise.all([
      require('./models/Account')(db).init(),
      require('./models/Activity')(db).init(),
      require('./models/Campaign')(db).init(),
      require('./models/ChatMessage')(db).init(),
      require('./models/Token')(db).init(),
    ]);
  } catch (error) {
    logger.fatal(error);
    process.exit(1);
  }
}
