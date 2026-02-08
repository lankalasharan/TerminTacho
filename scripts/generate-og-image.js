/**
 * Open Graph image generation script
 * Run with: node scripts/generate-og-image.js
 * 
 * This script creates an Open Graph image (1200x630) for social sharing
 * Requires: npm install sharp
 */

const sharp = require('sharp');
const path = require('path');

const width = 1200;
const height = 630;

async function generateOGImage() {
  try {
    console.log('Generating Open Graph image...');

    // Create a purple gradient image with text
    const svg = Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad)"/>
        <text x="60" y="200" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white">
          TerminTacho
        </text>
        <text x="60" y="290" font-family="Arial, sans-serif" font-size="48" fill="white" opacity="0.95">
          Real Processing Times for German Bureaucracy
        </text>
        <text x="60" y="380" font-family="Arial, sans-serif" font-size="32" fill="white" opacity="0.85">
          Anonymous, crowdsourced data from real people
        </text>
        <rect x="60" y="450" width="240" height="80" rx="12" fill="white" opacity="0.15"/>
        <text x="80" y="510" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white">
          termintacho.com
        </text>
      </svg>
    `);

    await sharp(svg)
      .png()
      .toFile(path.join(__dirname, '..', 'public', 'og-image.png'));

    console.log('✓ Generated og-image.png (1200x630)');
    console.log('\n✨ Open Graph image generated successfully!');
    console.log('Add this to your layout.tsx metadata:');
    console.log(`
  openGraph: {
    images: [
      {
        url: 'https://termintacho.com/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
    `);
  } catch (error) {
    console.error('Error generating OG image:', error);
    process.exit(1);
  }
}

generateOGImage();

