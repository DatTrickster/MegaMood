const fs = require('fs');
const path = require('path');

const PROPERTIES_FILE = 'android-release-signing.properties';

function loadSigningProperties(projectRoot) {
  const filePath = path.join(projectRoot, PROPERTIES_FILE);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const props = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      props[key] = value;
    }
  }
  const { storeFile, storePassword, keyAlias, keyPassword } = props;
  if (!storeFile || !storePassword || !keyAlias || !keyPassword) return null;
  return { storeFile, storePassword, keyAlias, keyPassword };
}

function withAndroidReleaseSigning(config) {
  const { withAppBuildGradle } = require('@expo/config-plugins/build/plugins/android-plugins');
  return withAppBuildGradle(config, async (config) => {
    const projectRoot = config.modRequest.projectRoot;
    const signing = loadSigningProperties(projectRoot) ||
      (process.env.MEGAMOOD_UPLOAD_STORE_FILE && {
        storeFile: process.env.MEGAMOOD_UPLOAD_STORE_FILE,
        storePassword: process.env.MEGAMOOD_UPLOAD_STORE_PASSWORD,
        keyAlias: process.env.MEGAMOOD_UPLOAD_KEY_ALIAS,
        keyPassword: process.env.MEGAMOOD_UPLOAD_KEY_PASSWORD,
      });
    if (!signing) return config;

    // storeFile path relative to android/app/ (e.g. ../../release.keystore when keystore is in project root)
    const appDir = path.join(projectRoot, 'android', 'app');
    const storePath = path.isAbsolute(signing.storeFile)
      ? signing.storeFile
      : path.join(projectRoot, signing.storeFile);
    const relativeToApp = path.relative(appDir, storePath).replace(/\\/g, '/');
    const storeFileLine = `storeFile file('${relativeToApp}')`;

    const signingBlock = `
    signingConfigs {
        release {
            ${storeFileLine}
            storePassword '${signing.storePassword.replace(/'/g, "\\'")}'
            keyAlias '${signing.keyAlias.replace(/'/g, "\\'")}'
            keyPassword '${signing.keyPassword.replace(/'/g, "\\'")}'
        }
    }
`;

    let buildGradle = config.modResults;

    // Insert signingConfigs inside android { }, right after "android {"
    const androidBlockStart = buildGradle.indexOf('android {');
    if (androidBlockStart === -1) return config;
    const insertIndex = buildGradle.indexOf('\n', androidBlockStart) + 1;
    buildGradle =
      buildGradle.slice(0, insertIndex) +
      signingBlock +
      buildGradle.slice(insertIndex);

    // Add signingConfig to release buildType
    const releaseBuildTypeMatch = buildGradle.match(/\bbuildTypes\s*\{[\s\S]*?release\s*\{/);
    if (releaseBuildTypeMatch) {
      const releaseStart = buildGradle.indexOf(releaseBuildTypeMatch[0]) + releaseBuildTypeMatch[0].length;
      const lineEnd = buildGradle.indexOf('\n', releaseStart) + 1;
      const signingConfigLine = '\n        signingConfig signingConfigs.release\n';
      buildGradle =
        buildGradle.slice(0, lineEnd) +
        signingConfigLine +
        buildGradle.slice(lineEnd);
    }

    config.modResults = buildGradle;
    return config;
  });
}

module.exports = withAndroidReleaseSigning;
