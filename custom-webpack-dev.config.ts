const ExtensionReloader = require('webpack-extension-reloader');
import config from './custom-webpack.config';

const options = {
  reloadPage: true,
  entries: {
    background: 'background',
  },
};

export default {
  ...config,
  mode: 'development',
  plugins: [new ExtensionReloader(options)],
};
