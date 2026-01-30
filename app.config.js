module.exports = {
  expo: {
    name: 'MegaMood',
    slug: 'MegaMood',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/Icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'MegaMood uses your location to show weather for your area when "Use precise location" is enabled in Settings.',
      },
      bundleIdentifier: 'com.anonymous.MegaMood',
    },
    android: {
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
      ],
      adaptiveIcon: {
        foregroundImage: './assets/Icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.anonymous.MegaMood',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['./plugins/withAndroidReleaseSigning.js'],
  },
};
