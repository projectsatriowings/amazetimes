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

  let masterLogoPath = path.join(rootDir, 'Amaze times.jpg');
  if (!fs.existsSync(masterLogoPath)) {
    masterLogoPath = path.join(publicDir, 'Amaze times.jpg');
  }

  if (fs.existsSync(masterLogoPath)) {
    const rawLogoBuffer = fs.readFileSync(masterLogoPath);

    // 0. Stripped master logo copy for public
    const cleanLogoJpg = await sharp(rawLogoBuffer)
      .withMetadata(false)
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(path.join(publicDir, 'Amaze times.jpg'), cleanLogoJpg);
    fs.writeFileSync(path.join(publicDir, 'amaze-times-logo.jpg'), cleanLogoJpg);
    console.log('✅ Synchronized public/Amaze times.jpg (metadata stripped)');

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
        .withMetadata(false)
        .png()
        .toBuffer();
    }

    // 1. Generate 32x32 PNG for favicon.png
    const png32 = await createSquareIcon(32, 0.04);
    fs.writeFileSync(path.join(publicDir, 'favicon.png'), png32);
    console.log('✅ Generated public/favicon.png (32x32)');

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
    console.log('✅ Generated PWA icons (192x192, 512x512)');

    // 5. Generate favicon.svg & icon.svg embedding the crisp 512x512 logo
    const b64 = icon512.toString('base64');
    const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,${b64}" width="512" height="512" />
</svg>
`;
    fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon);
    fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgFavicon);
    console.log('✅ Generated public/favicon.svg and public/icon.svg');

    // 6. Generate modern WebP version of Amaze times logo
    const cleanWebp = await sharp(rawLogoBuffer)
      .withMetadata(false)
      .webp({ quality: 90 })
      .toBuffer();
    fs.writeFileSync(path.join(publicDir, 'Amaze times.webp'), cleanWebp);
    fs.writeFileSync(path.join(publicDir, 'amaze-times-logo.webp'), cleanWebp);
    console.log('✅ Generated public/Amaze times.webp and amaze-times-logo.webp');

    // 7. Generate true 1200x630 OG banner with exact dimensions & zero metadata
    const ogLogo = await sharp(trimmedBuffer)
      .resize({ width: 380, height: 460, fit: 'inside' })
      .toBuffer();
    const ogLogoMeta = await sharp(ogLogo).metadata();

    const bannerSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070d1e"/>
      <stop offset="50%" stop-color="#0e2a7a"/>
      <stop offset="100%" stop-color="#070d1e"/>
    </linearGradient>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#DC2626"/>
      <stop offset="100%" stop-color="#EF4444"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="8" fill="url(#redGrad)"/>
  <rect x="0" y="622" width="1200" height="8" fill="url(#redGrad)"/>
  <rect x="80" y="75" width="440" height="480" rx="32" fill="#FFFFFF" fill-opacity="0.98"/>
  <text x="560" y="240" font-family="'Noto Sans Tamil', 'Anek Tamil', Arial, sans-serif" font-size="60" font-weight="900" fill="#FFFFFF">அமேஸ் டைம்ஸ்</text>
  <text x="560" y="310" font-family="Arial, sans-serif" font-size="36" font-weight="800" fill="#FBBF24">AMAZE TIMES</text>
  <text x="560" y="375" font-family="'Noto Sans Tamil', 'Anek Tamil', Arial, sans-serif" font-size="26" font-weight="600" fill="#E2E8F0">தமிழ்நாட்டின் முன்னணி நாளிதழ்</text>
  <text x="560" y="425" font-family="'Noto Sans Tamil', 'Anek Tamil', Arial, sans-serif" font-size="20" font-weight="500" fill="#94A3B8">உண்மை • உடனுக்குடன் • நடுநிலை செய்திகள்</text>
</svg>`;

    const bannerBg = await sharp(Buffer.from(bannerSvg)).png().toBuffer();
    const ogFinal = await sharp(bannerBg)
      .composite([{
        input: ogLogo,
        left: 80 + Math.round((440 - ogLogoMeta.width) / 2),
        top: 75 + Math.round((480 - ogLogoMeta.height) / 2)
      }])
      .withMetadata(false)
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, 'og-image.jpg'), ogFinal);
    const ogWebp = await sharp(ogFinal).withMetadata(false).webp({ quality: 85 }).toBuffer();
    fs.writeFileSync(path.join(publicDir, 'og-image.webp'), ogWebp);
    console.log('✅ Generated 1200x630 public/og-image.jpg and public/og-image.webp');
  }

  console.log('🎉 All favicon, logo, and OG banner optimizations completed successfully!');
}

run().catch((err) => {
  console.error('❌ Optimization failed:', err);
  process.exit(1);
});
