import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');

// Helper to wrap PNG buffer into standard Windows ICO format
function pngToIco(pngBuffer, width = 32, height = 32) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type 1 = icon
  header.writeUInt16LE(1, 4); // 1 image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(width >= 256 ? 0 : width, 0);
  entry.writeUInt8(height >= 256 ? 0 : height, 1);
  entry.writeUInt8(0, 2); // Colors
  entry.writeUInt8(0, 3); // Reserved
  entry.writeUInt16LE(1, 4); // Color planes
  entry.writeUInt16LE(32, 6); // Bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8); // Size of image data
  entry.writeUInt32LE(22, 12); // Offset to image data (6 + 16)

  return Buffer.concat([header, entry, pngBuffer]);
}

async function run() {
  console.log('🔄 Optimizing assets and generating modern WebP / Favicon files...');

  const svgPath = path.join(publicDir, 'favicon.svg');
  if (fs.existsSync(svgPath)) {
    const svgBuffer = fs.readFileSync(svgPath);

    // 1. Generate 32x32 PNG for favicon.png
    const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
    fs.writeFileSync(path.join(publicDir, 'favicon.png'), png32);
    console.log('✅ Generated public/favicon.png (32x32, stripped metadata)');

    // 2. Generate standard favicon.ico from 32x32 PNG
    const ico = pngToIco(png32, 32, 32);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
    console.log(`✅ Generated public/favicon.ico (${ico.length} bytes, true ICO format)`);

    // 3. Generate Apple Touch Icon 180x180
    await sharp(svgBuffer)
      .resize(180, 180)
      .png({ quality: 90 })
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✅ Generated public/apple-touch-icon.png (180x180)');

    // 4. Generate PWA Icons 192x192 & 512x512
    await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
    await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✅ Generated PWA icons (192x192, 512x512)');
  }

  // 5. Optimize og-image.jpg, amaze-times-logo.jpg, Amaze times.jpg
  // Strip metadata (strips all EXIF/GPS/ICC excess) and create .webp versions
  const rasterFiles = ['og-image.jpg', 'amaze-times-logo.jpg', 'Amaze times.jpg'];
  for (const filename of rasterFiles) {
    const filePath = path.join(publicDir, filename);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      
      // Strip metadata from the JPEG itself
      const cleanJpg = await sharp(buffer)
        .withMetadata(false) // Strips EXIF metadata completely
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
      fs.writeFileSync(filePath, cleanJpg);

      // Create modern WebP version
      const webpName = filename.replace(/\.jpg$/i, '.webp');
      const cleanWebp = await sharp(buffer)
        .withMetadata(false)
        .webp({ quality: 85 })
        .toBuffer();
      fs.writeFileSync(path.join(publicDir, webpName), cleanWebp);
      console.log(`✅ Optimized ${filename} (stripped metadata) and generated ${webpName}`);
    }
  }

  console.log('🎉 All image optimizations completed successfully!');
}

run().catch((err) => {
  console.error('❌ Optimization failed:', err);
  process.exit(1);
});
