/**
 * Favicon generation script
 * Run with: node scripts/generate-favicons.js
 * 
 * This script creates favicon sizes from the logo.png file
 * Requires: npm install sharp
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicPath = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicPath, 'logo.png');

async function generateFavicons() {
  try {
    console.log('Generating favicons from logo.png...');

    // Generate 32x32 favicon
    await sharp(logoPath)
      .resize(32, 32, { fit: 'cover' })
      .png()
      .toFile(path.join(publicPath, 'favicon-32x32.png'));
    console.log('✓ Generated favicon-32x32.png');

    // Generate 16x16 favicon
    await sharp(logoPath)
      .resize(16, 16, { fit: 'cover' })
      .png()
      .toFile(path.join(publicPath, 'favicon-16x16.png'));
    console.log('✓ Generated favicon-16x16.png');

    // Generate apple-touch-icon (180x180)
    await sharp(logoPath)
      .resize(180, 180, { fit: 'cover' })
      .png()
      .toFile(path.join(publicPath, 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png');

    // Generate favicon.ico (32x32)
    await sharp(logoPath)
      .resize(32, 32, { fit: 'cover' })
      .toICO()
      .toFile(path.join(publicPath, 'favicon.ico'));
    console.log('✓ Generated favicon.ico');

    console.log('\n✨ All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();

