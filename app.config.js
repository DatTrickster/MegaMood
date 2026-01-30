const appJson = require('./app.json');

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    plugins: [
      ...(appJson.expo.plugins || []),
      './plugins/withAndroidReleaseSigning.js',
    ],
  },
};
