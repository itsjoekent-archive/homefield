const logger = require('../logger');

module.exports = function endProcessOnFail(error) {
  logger.error(error);
  process.exit(1);
}
