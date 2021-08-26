'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./base.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"'
})
