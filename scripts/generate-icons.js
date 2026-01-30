#!/usr/bin/env node
/**
 * Generates app icons from a single source image (1024x1024).
 * Source: assets/icon-source.png (or assets/Icon.png if source missing)
 * Outputs: Icon.png, adaptive-icon.png, favicon.png, splash-icon.png
 */
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const SOURCE_FILE = path.join(ASSETS_DIR, 'icon-source.png');
const FALLBACK_SOURCE = path.join(ASSETS_DIR, 'Icon.png');

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('Run: npm install --save-dev sharp');
    process.exit(1);
  }

  const sourcePath = fs.existsSync(SOURCE_FILE) ? SOURCE_FILE : FALLBACK_SOURCE;
  if (!fs.existsSync(sourcePath)) {
    console.warn('No icon source found (icon-source.png or Icon.png). Skip icon generation.');
    return;
  }

  const source = sharp(sourcePath);
  const metadata = await source.metadata();
  const size = metadata.width || metadata.height || 1024;

  // Ensure square for icon
  const iconBuffer = await source
    .resize(1024, 1024)
    .png()
    .toBuffer();

  // Icon.png + adaptive-icon.png (same 1024x1024 for Expo)
  const iconPath = path.join(ASSETS_DIR, 'Icon.png');
  const adaptivePath = path.join(ASSETS_DIR, 'adaptive-icon.png');
  await fs.promises.writeFile(iconPath, iconBuffer);
  await fs.promises.writeFile(adaptivePath, iconBuffer);
  console.log('Generated Icon.png, adaptive-icon.png (1024x1024)');

  // Favicon 48x48
  const faviconBuffer = await sharp(sourcePath)
    .resize(48, 48)
    .png()
    .toBuffer();
  await fs.promises.writeFile(path.join(ASSETS_DIR, 'favicon.png'), faviconBuffer);
  console.log('Generated favicon.png (48x48)');

  // Splash: centered icon on transparent or white; Expo scales. Use 1024x1024 for simplicity.
  const splashBuffer = await sharp(sourcePath)
    .resize(1024, 1024)
    .png()
    .toBuffer();
  await fs.promises.writeFile(path.join(ASSETS_DIR, 'splash-icon.png'), splashBuffer);
  console.log('Generated splash-icon.png (1024x1024)');

  console.log('Icon generation done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
