import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
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
  console.log('🔄 Generating crisp Favicon suite and WebP from authentic "Amaze times.jpg"...');

  // Master logo from workspace root
  let masterLogoPath = path.join(rootDir, 'Amaze times.jpg');
  if (!fs.existsSync(masterLogoPath)) {
    masterLogoPath = path.join(publicDir, 'Amaze times.jpg');
  }

  if (fs.existsSync(masterLogoPath)) {
    const rawLogoBuffer = fs.readFileSync(masterLogoPath);

    // Keep public/Amaze times.jpg perfectly identical to master logo
    fs.writeFileSync(path.join(publicDir, 'Amaze times.jpg'), rawLogoBuffer);
    fs.writeFileSync(path.join(publicDir, 'amaze-times-logo.jpg'), rawLogoBuffer);
    console.log('✅ Synchronized public/Amaze times.jpg from authentic master logo');

    // Trim whitespace around the red 'அ' and blue pen nib
    const trimmedBuffer = await sharp(rawLogoBuffer).trim().toBuffer();

    // Generate square icon where the logo prominently fills the canvas
    async function createSquareIcon(size, paddingRatio = 0.04) {
      const padding = Math.max(1, Math.round(size * paddingRatio));
      const maxDim = size - (padding * 2);

      const resizedLogo = await sharp(trimmedBuffer)
        .resize({ width: maxDim, height: maxDim, fit: 'inside' })
        .toBuffer();

      const meta = await sharp(resizedLogo).metadata();

      // Clean white background canvas
      const bg = await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      }).png().toBuffer();

      return sharp(bg)
        .composite([{
          input: resizedLogo,
          top: Math.round((size - meta.height) / 2),
          left: Math.round((size - meta.width) / 2)
        }])
        .png()
        .toBuffer();
    }

    // 1. Generate 32x32 PNG for favicon.png
    const png32 = await createSquareIcon(32, 0.04);
    fs.writeFileSync(path.join(publicDir, 'favicon.png'), png32);
    console.log('✅ Generated public/favicon.png (32x32 from Amaze times.jpg)');

    // 2. Generate standard favicon.ico from 32x32 PNG
    const ico = pngToIco(png32, 32, 32);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
    console.log(`✅ Generated public/favicon.ico (${ico.length} bytes, true ICO format)`);

    // 3. Generate Apple Touch Icon 180x180
    const icon180 = await createSquareIcon(180, 0.05);
    fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), icon180);
    console.log('✅ Generated public/apple-touch-icon.png (180x180)');

    // 4. Generate PWA Icons 192x192 & 512x512
    const icon192 = await createSquareIcon(192, 0.05);
    fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
    const icon512 = await createSquareIcon(512, 0.05);
    fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
    console.log('✅ Generated PWA icons (192x192, 512x512 from Amaze times.jpg)');

    // 5. Generate favicon.svg embedding the crisp 512x512 logo
    const b64 = icon512.toString('base64');
    const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,${b64}" width="512" height="512" />
</svg>
`;
    fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon);
    console.log('✅ Generated public/favicon.svg from authentic Amaze times.jpg');

    // 6. Generate modern WebP version of Amaze times logo
    const cleanWebp = await sharp(rawLogoBuffer)
      .withMetadata(false)
      .webp({ quality: 90 })
      .toBuffer();
    fs.writeFileSync(path.join(publicDir, 'Amaze times.webp'), cleanWebp);
    fs.writeFileSync(path.join(publicDir, 'amaze-times-logo.webp'), cleanWebp);
    console.log('✅ Generated public/Amaze times.webp and amaze-times-logo.webp');
  }

  // 7. Optimize og-image.jpg
  const ogPath = path.join(publicDir, 'og-image.jpg');
  if (fs.existsSync(ogPath)) {
    const ogBuf = fs.readFileSync(ogPath);
    const ogWebp = await sharp(ogBuf).withMetadata(false).webp({ quality: 85 }).toBuffer();
    fs.writeFileSync(path.join(publicDir, 'og-image.webp'), ogWebp);
    console.log('✅ Generated public/og-image.webp');
  }

  console.log('🎉 All favicon and logo optimizations completed successfully!');
}

run().catch((err) => {
  console.error('❌ Optimization failed:', err);
  process.exit(1);
});
