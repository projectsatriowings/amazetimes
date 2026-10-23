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
  console.log('🔄 Optimizing assets and generating modern WebP / Favicon files from our authentic logo...');

  const masterLogoPath = path.join(publicDir, 'amaze-times-logo.jpg');
  if (fs.existsSync(masterLogoPath)) {
    const rawLogoBuffer = fs.readFileSync(masterLogoPath);
    // Trim white margins around the red 'அ' and blue pen nib
    const trimmedBuffer = await sharp(rawLogoBuffer).trim().toBuffer();

    // Helper to generate square icon with clean circular badge for high contrast
    async function createSquareIcon(size, paddingRatio = 0.12) {
      const padding = Math.round(size * paddingRatio);
      const targetH = size - (padding * 2);

      const resizedLogo = await sharp(trimmedBuffer)
        .resize({ height: targetH, fit: 'inside' })
        .toBuffer();

      const meta = await sharp(resizedLogo).metadata();

      const radius = Math.round(size / 2) - 1;
      const strokeW = Math.max(1, Math.round(size / 64));
      const svgCircle = Buffer.from(
        `<svg width="${size}" height="${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="#ffffff" stroke="#e2e8f0" stroke-width="${strokeW}" />
        </svg>`
      );

      const circleBg = await sharp(svgCircle).png().toBuffer();

      return sharp(circleBg)
        .composite([{
          input: resizedLogo,
          top: Math.round((size - meta.height) / 2),
          left: Math.round((size - meta.width) / 2)
        }])
        .png()
        .toBuffer();
    }

    // 1. Generate 32x32 PNG for favicon.png
    const png32 = await createSquareIcon(32, 0.08);
    fs.writeFileSync(path.join(publicDir, 'favicon.png'), png32);
    console.log('✅ Generated public/favicon.png (32x32 from Amaze Times logo)');

    // 2. Generate standard favicon.ico from 32x32 PNG
    const ico = pngToIco(png32, 32, 32);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
    console.log(`✅ Generated public/favicon.ico (${ico.length} bytes, true ICO format)`);

    // 3. Generate Apple Touch Icon 180x180
    const icon180 = await createSquareIcon(180, 0.10);
    fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), icon180);
    console.log('✅ Generated public/apple-touch-icon.png (180x180)');

    // 4. Generate PWA Icons 192x192 & 512x512
    const icon192 = await createSquareIcon(192, 0.10);
    fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
    const icon512 = await createSquareIcon(512, 0.10);
    fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
    console.log('✅ Generated PWA icons (192x192, 512x512)');

    // 5. Generate favicon.svg embedding the crisp 512x512 logo
    const b64 = icon512.toString('base64');
    const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,${b64}" width="512" height="512" />
</svg>
`;
    fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon);
    console.log('✅ Generated public/favicon.svg from authentic Amaze Times logo');
  }

  // 6. Optimize og-image.jpg, amaze-times-logo.jpg, Amaze times.jpg
  // Strip metadata and create .webp versions
  const rasterFiles = ['og-image.jpg', 'amaze-times-logo.jpg', 'Amaze times.jpg'];
  for (const filename of rasterFiles) {
    const filePath = path.join(publicDir, filename);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      
      // Strip metadata from the JPEG itself
      const cleanJpg = await sharp(buffer)
        .withMetadata(false)
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
