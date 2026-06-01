import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');
const svgPath = path.join(publicDir, 'icon.svg');

// Check if SVG exists
if (!fs.existsSync(svgPath)) {
  console.log('❌ icon.svg not found in public directory');
  process.exit(1);
}

console.log('🎨 Generating PWA icons from SVG...');

async function generateIcons() {
  try {
    // Generate 192x192 icon
    const icon192Path = path.join(publicDir, 'icon-192x192.png');
    await sharp(svgPath)
      .resize(192, 192)
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(icon192Path);
    
    const icon192Stats = fs.statSync(icon192Path);
    console.log(`✅ Generated icon-192x192.png (${(icon192Stats.size / 1024).toFixed(2)} KB)`);

    // Generate 512x512 icon
    const icon512Path = path.join(publicDir, 'icon-512x512.png');
    await sharp(svgPath)
      .resize(512, 512)
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(icon512Path);
    
    const icon512Stats = fs.statSync(icon512Path);
    console.log(`✅ Generated icon-512x512.png (${(icon512Stats.size / 1024).toFixed(2)} KB)`);

    console.log('\n🎉 PWA icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
