// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path');

module.exports = {
  envs: {
    prod: require('./prod.env'),
    log: require('./log.env'),
    wiki: require('./wiki.env'),
  },
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/m2/',
    productionSourceMap: false,
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require('./dev.env'),
    port: 10081,
    autoOpenBrowser: true,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      '/static': {
        target: 'http://localhost/static',
        changeOrigin: true,
        pathRewrite: {
          '^/static': '',
          secure: false
        },
        onProxyReq: function(proxyReq, req, res) {
          proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
          proxyReq.setHeader('Host', req.hostname);
        }
      },
      '/data': {
        target: 'http://localhost/data',
        changeOrigin: true,
        pathRewrite: {
          '^/data': '',
          secure: false
        },
        onProxyReq: function(proxyReq, req, res) {
          proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
          proxyReq.setHeader('Host', req.hostname);
        }
      },
      '/img': {
        target: 'http://localhost/img',
        changeOrigin: true,
        pathRewrite: {
          '^/img': '',
          secure: false
        },
        onProxyReq: function(proxyReq, req, res) {
          proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
          proxyReq.setHeader('Host', req.hostname);
        }
      },
      '/apid1': {
        target: 'http://localhost:3600/apid1',
        changeOrigin: true,
        pathRewrite: {
          '^/apid1': '',
          secure: false
        },
        onProxyReq: function(proxyReq, req, res) {
          proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
          proxyReq.setHeader('Host', req.hostname);
        }
      },
      '/css': {
        target: 'http://localhost/css',
        changeOrigin: true,
        pathRewrite: {
          '^/css': '',
          secure: false
        },
        onProxyReq: function(proxyReq, req, res) {
          proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
          proxyReq.setHeader('Host', req.hostname);
        }
      },
      '/js': {
        target: 'http://localhost/js',
        changeOrigin: true,
        pathRewrite: {
          '^/js': '',
          secure: false
        },
        onProxyReq: function(proxyReq, req, res) {
          proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
          proxyReq.setHeader('Host', req.hostname);
        }
      },
      '/fonts': {
        target: 'http://localhost/fonts',
        changeOrigin: true,
        pathRewrite: {
          '^/fonts': '',
          secure: false
        },
        onProxyReq: function(proxyReq, req, res) {
          proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
          proxyReq.setHeader('Host', req.hostname);
        }
      },
      '/middlephp': {
        target: 'http://localhost/middlephp',
        changeOrigin: true,
        pathRewrite: {
          '^/middlephp': '',
          secure: false
        },
        onProxyReq: function(proxyReq, req, res) {
          proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
          proxyReq.setHeader('Host', req.hostname);
        }
      },
    },
    cssSourceMap: false
  }
};
