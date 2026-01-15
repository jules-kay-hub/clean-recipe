/**
 * Generate Expo app icons from SVG source
 * Run with: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// SVG source - Julienned minimal icon
const ICON_SVG = path.join(ASSETS_DIR, 'julienned-icon.svg');

// Expo/main outputs
const outputs = [
  { name: 'icon.png', size: 1024 },
  { name: 'adaptive-icon.png', size: 1024, padding: 20 },
  { name: 'favicon.png', size: 48 },
  { name: 'splash-icon.png', size: 512 },
];

// iOS App Store sizes
const iosExportSizes = [
  { name: 'ios/icon-20.png', size: 20 },
  { name: 'ios/icon-20@2x.png', size: 40 },
  { name: 'ios/icon-20@3x.png', size: 60 },
  { name: 'ios/icon-29.png', size: 29 },
  { name: 'ios/icon-29@2x.png', size: 58 },
  { name: 'ios/icon-29@3x.png', size: 87 },
  { name: 'ios/icon-40.png', size: 40 },
  { name: 'ios/icon-40@2x.png', size: 80 },
  { name: 'ios/icon-40@3x.png', size: 120 },
  { name: 'ios/icon-60@2x.png', size: 120 },
  { name: 'ios/icon-60@3x.png', size: 180 },
  { name: 'ios/icon-76.png', size: 76 },
  { name: 'ios/icon-76@2x.png', size: 152 },
  { name: 'ios/icon-83.5@2x.png', size: 167 },
  { name: 'ios/icon-1024.png', size: 1024 },
];

// Android Play Store sizes
const androidExportSizes = [
  { name: 'android/mipmap-mdpi/ic_launcher.png', size: 48 },
  { name: 'android/mipmap-hdpi/ic_launcher.png', size: 72 },
  { name: 'android/mipmap-xhdpi/ic_launcher.png', size: 96 },
  { name: 'android/mipmap-xxhdpi/ic_launcher.png', size: 144 },
  { name: 'android/mipmap-xxxhdpi/ic_launcher.png', size: 192 },
  { name: 'android/playstore-icon.png', size: 512 },
];

// Splash screen specs
const SPLASH_WIDTH = 1284;
const SPLASH_HEIGHT = 2778;
const SPLASH_BG = '#2D6A4F'; // Forest Green - Julienned brand primary

async function generateIcon(output, svgBuffer) {
  const { name, size, padding = 0 } = output;
  const outputPath = path.join(ASSETS_DIR, name);

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log(`Generating ${name} (${size}x${size})...`);

  // Calculate size with padding for adaptive icon
  const contentSize = size - (padding * 2 * (size / 100));

  if (padding > 0) {
    // For adaptive icon, we need to add padding
    await sharp(svgBuffer)
      .resize(Math.round(contentSize), Math.round(contentSize))
      .extend({
        top: Math.round((size - contentSize) / 2),
        bottom: Math.round((size - contentSize) / 2),
        left: Math.round((size - contentSize) / 2),
        right: Math.round((size - contentSize) / 2),
        background: { r: 45, g: 106, b: 79, alpha: 1 } // #2D6A4F Forest Green
      })
      .png()
      .toFile(outputPath);
  } else {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
  }

  console.log(`  ✓ Created ${outputPath}`);
}

async function generateSplash(svgBuffer) {
  console.log(`Generating splash.png (${SPLASH_WIDTH}x${SPLASH_HEIGHT})...`);

  const outputPath = path.join(ASSETS_DIR, 'splash.png');
  const iconSize = 400;

  // Read and resize the icon
  const iconBuffer = await sharp(svgBuffer)
    .resize(iconSize, iconSize)
    .png()
    .toBuffer();

  // Create splash with centered icon on copper background
  await sharp({
    create: {
      width: SPLASH_WIDTH,
      height: SPLASH_HEIGHT,
      channels: 4,
      background: { r: 45, g: 106, b: 79, alpha: 1 } // #2D6A4F Forest Green
    }
  })
    .composite([{
      input: iconBuffer,
      top: Math.round((SPLASH_HEIGHT - iconSize) / 2),
      left: Math.round((SPLASH_WIDTH - iconSize) / 2),
    }])
    .png()
    .toFile(outputPath);

  console.log(`  ✓ Created ${outputPath}`);
}

async function main() {
  console.log('🎨 Generating Julienned app icons from SVG...\n');

  // Check if source SVG exists
  if (!fs.existsSync(ICON_SVG)) {
    console.error(`Error: ${ICON_SVG} not found`);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(ICON_SVG);

  // Generate main Expo outputs
  console.log('--- Expo Icons ---');
  for (const output of outputs) {
    await generateIcon(output, svgBuffer);
  }

  // Generate splash screen
  await generateSplash(svgBuffer);

  // Check for --all flag to generate iOS/Android exports
  if (process.argv.includes('--all')) {
    console.log('\n--- iOS App Store Icons ---');
    for (const output of iosExportSizes) {
      await generateIcon(output, svgBuffer);
    }

    console.log('\n--- Android Play Store Icons ---');
    for (const output of androidExportSizes) {
      await generateIcon(output, svgBuffer);
    }
  }

  console.log('\n✅ All icons generated successfully!');
  console.log('\nFiles created:');
  console.log('  - assets/icon.png (1024x1024) - Main app icon');
  console.log('  - assets/adaptive-icon.png (1024x1024) - Android adaptive icon');
  console.log('  - assets/favicon.png (48x48) - Web favicon');
  console.log('  - assets/splash.png - Splash screen');
  console.log('  - assets/splash-icon.png (512x512) - Splash icon standalone');

  if (process.argv.includes('--all')) {
    console.log('  - assets/ios/ - iOS App Store icons');
    console.log('  - assets/android/ - Android Play Store icons');
  } else {
    console.log('\nRun with --all flag to also generate iOS/Android store icons');
  }
}

main().catch(console.error);
