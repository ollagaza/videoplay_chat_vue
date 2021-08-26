const merge = require('webpack-merge');
const baseEnv = require('./base.env');

module.exports = merge(baseEnv, {
  DEBUG_LOG: '"Y"',
  WIKI: '"Y"'
});
