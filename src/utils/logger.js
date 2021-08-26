import VueLogger from 'vuejs-logger';
import config from '../config';

const logger = VueLogger.initLoggerInstance(config.getLogOption(), VueLogger.logLevels);
// logger.debug('log_option', config.getLogOption());
// logger.debug('log_level', config.getLogLevel());
export default {
  debug: logger.debug,
  error: logger.error,
  warn: logger.warn,
};
