// import * as Constant from './constants';

const env = process.env || {};

const log_level = env.DEBUG_LOG === 'Y' || env.NODE_ENV === 'development' ? 'debug' : 'error';
const log_options = {
  isEnabled: true,
  logLevel: log_level,
  stringifyArguments: false,
  showlogLevelLogLevel: true,
  showMethodName: true,
  separator: '/',
  showConsoleColors: true,
};
let system_type = null;

export default {
  getLogLevel: () => log_level,
  getLogOption: () => log_options,
  setSystemType: (type) => {
    system_type = type;
  },
};
