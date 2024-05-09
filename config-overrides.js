

const {  overrideDevServer } = require('customize-cra');

const addDevServerCOOPReponseHeader = (config) => {
    config.headers = {
      ...config.headers,
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    };
    config.devMiddleware = {
      ...config.devMiddleware,
      writeToDisk: true,
    }
    return config;
};

module.exports = {
    devServer: overrideDevServer(addDevServerCOOPReponseHeader)
  };
  