var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'psyche'
    },
    port: process.env.PORT || 3000,
    endpoint: 'https://xxifk8vkka.execute-api.us-east-1.amazonaws.com/prod/healthy-berry-staging-index',
    api: 'https://api-staging.yamsafer.me/',
    elastic: {
      host: 'localhost:9200',
      type: 'property',
      index: 'properties'
    }
  },

  staging: {
    root: rootPath,
    app: {
      name: 'psyche'
    },
    port: process.env.PORT || 3000,
    endpoint: 'https://xxifk8vkka.execute-api.us-east-1.amazonaws.com/prod/healthy-berry-staging-index',
    api: 'https://api-staging.yamsafer.me/',
    elastic: {
      host: 'elastic-staging.yamsafer.me:9200',
      type: 'property',
      index: 'extranet_properties'
    }
  },

  production: {
    root: rootPath,
    app: {
      name: 'psyche'
    },
    port: process.env.PORT || 3000,
    endpoint: 'https://sfgc1ja7cc.execute-api.us-east-1.amazonaws.com/staging/healthy-berry-staging-index',
    api: 'https://api-staging.yamsafer.me/',
    elastic: {
      host: 'elastic-staging.yamsafer.me:9200',
      type: 'property',
      index: 'extranet_properties'
    }
  }
};

module.exports = config[env];
