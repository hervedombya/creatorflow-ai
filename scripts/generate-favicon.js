// Script to generate favicon.ico from SVG
// Run: node scripts/generate-favicon.js
// Requires: sharp (npm install sharp)

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    const svgPath = path.join(__dirname, '../public/favicon.svg');
    const icoPath = path.join(__dirname, '../public/favicon.ico');
    const appIcoPath = path.join(__dirname, '../app/favicon.ico');

    // Generate multiple sizes for ICO
    const sizes = [16, 32, 48];
    const buffers = [];

    for (const size of sizes) {
      const buffer = await sharp(svgPath)
        .resize(size, size)
        .png()
        .toBuffer();
      buffers.push({ size, buffer });
    }

    // For now, just copy the 32x32 PNG as favicon
    // Note: Proper ICO format would require a library like 'to-ico'
    await sharp(svgPath)
      .resize(32, 32)
      .png()
      .toFile(icoPath.replace('.ico', '-32.png'));

    console.log('✅ Favicon generated!');
    console.log('Note: For proper .ico format, use an online converter or install "to-ico" package');
    console.log('SVG favicon is already configured and will work in modern browsers');
  } catch (error) {
    console.error('Error generating favicon:', error.message);
    console.log('\n💡 Alternative: Use an online SVG to ICO converter:');
    console.log('   https://convertio.co/svg-ico/');
    console.log('   Upload public/favicon.svg and download as favicon.ico');
  }
}

generateFavicon();
