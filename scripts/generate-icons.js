/**
 * Generate Expo app icons from SVG source
 * Run with: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// SVG sources
const ICON_SVG = path.join(ASSETS_DIR, 'icon-concept.svg');
const ICON_SIMPLE_SVG = path.join(ASSETS_DIR, 'icon-simple.svg');

// Output files
const outputs = [
  { name: 'icon.png', size: 1024, source: ICON_SVG },
  { name: 'adaptive-icon.png', size: 1024, source: ICON_SVG, padding: 20 },
  { name: 'favicon.png', size: 48, source: ICON_SIMPLE_SVG },
  { name: 'splash-icon.png', size: 512, source: ICON_SVG },
];

// Splash screen specs
const SPLASH_WIDTH = 1284;
const SPLASH_HEIGHT = 2778;
const SPLASH_BG = '#FAF8F5';

async function generateIcon(output) {
  const { name, size, source, padding = 0 } = output;
  const outputPath = path.join(ASSETS_DIR, name);

  console.log(`Generating ${name} (${size}x${size})...`);

  const svgBuffer = fs.readFileSync(source);

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
        background: { r: 250, g: 248, b: 245, alpha: 1 } // #FAF8F5
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

async function generateSplash() {
  console.log(`Generating splash.png (${SPLASH_WIDTH}x${SPLASH_HEIGHT})...`);

  const outputPath = path.join(ASSETS_DIR, 'splash.png');
  const iconSize = 400;

  // Read and resize the icon
  const svgBuffer = fs.readFileSync(ICON_SVG);
  const iconBuffer = await sharp(svgBuffer)
    .resize(iconSize, iconSize)
    .png()
    .toBuffer();

  // Create splash with centered icon
  await sharp({
    create: {
      width: SPLASH_WIDTH,
      height: SPLASH_HEIGHT,
      channels: 4,
      background: { r: 250, g: 248, b: 245, alpha: 1 } // #FAF8F5
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
  console.log('🎨 Generating Expo app icons from SVG...\n');

  // Check if source SVGs exist
  if (!fs.existsSync(ICON_SVG)) {
    console.error(`Error: ${ICON_SVG} not found`);
    process.exit(1);
  }

  if (!fs.existsSync(ICON_SIMPLE_SVG)) {
    console.error(`Error: ${ICON_SIMPLE_SVG} not found`);
    process.exit(1);
  }

  // Generate all icons
  for (const output of outputs) {
    await generateIcon(output);
  }

  // Generate splash screen
  await generateSplash();

  console.log('\n✅ All icons generated successfully!');
  console.log('\nFiles created:');
  console.log('  - assets/icon.png (1024x1024) - Main app icon');
  console.log('  - assets/adaptive-icon.png (1024x1024) - Android adaptive icon');
  console.log('  - assets/favicon.png (48x48) - Web favicon');
  console.log('  - assets/splash.png - Splash screen');
  console.log('  - assets/splash-icon.png (512x512) - Splash icon standalone');
}

main().catch(console.error);
