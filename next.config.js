const withImages = require('next-images');
const path = require('path');

module.exports = withImages({
  webpack(config, options) {
    config.resolve.alias['assets'] = path.join(__dirname, 'assets');
    config.resolve.alias['components'] = path.join(__dirname, 'components');
    return config;
  },
});
