import fs from 'fs';
import zlib from 'zlib';

// CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createPngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePng(size) {
  const width = size;
  const height = size;

  // Raw RGBA image data with scanline filter byte (0x00)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  // Background: Deep red (#DC2626) with golden emblem
  const bgR = 0xdc, bgG = 0x26, bgB = 0x26;
  const goldR = 0xf5, goldG = 0x9e, goldB = 0x0b;
  const whiteR = 0xff, whiteG = 0xff, whiteB = 0xff;

  const center = size / 2;
  const radius = size * 0.42;
  const innerRadius = size * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= innerRadius) {
        // Center: Deep Navy Blue (#0F172A) with gold inner accent
        const isLetter = (
          // Stylized "A" letter shape in the center
          (Math.abs(dx) < size * 0.18 && dy > -size * 0.22 && dy < size * 0.22 && Math.abs(dx - dy * 0.35) < size * 0.05) ||
          (Math.abs(dx) < size * 0.18 && dy > -size * 0.22 && dy < size * 0.22 && Math.abs(dx + dy * 0.35) < size * 0.05) ||
          (dy >= 0 && dy <= size * 0.06 && Math.abs(dx) < size * 0.12)
        );

        if (isLetter) {
          rawData[pxOffset] = whiteR;
          rawData[pxOffset + 1] = whiteG;
          rawData[pxOffset + 2] = whiteB;
          rawData[pxOffset + 3] = 255;
        } else {
          rawData[pxOffset] = 0x0f;
          rawData[pxOffset + 1] = 0x17;
          rawData[pxOffset + 2] = 0x2a;
          rawData[pxOffset + 3] = 255;
        }
      } else if (dist <= radius) {
        // Gold circular border ring
        rawData[pxOffset] = goldR;
        rawData[pxOffset + 1] = goldG;
        rawData[pxOffset + 2] = goldB;
        rawData[pxOffset + 3] = 255;
      } else {
        // Outer rich newspaper red rounded squircle background
        rawData[pxOffset] = bgR;
        rawData[pxOffset + 1] = bgG;
        rawData[pxOffset + 2] = bgB;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createPngChunk('IHDR', ihdrData);

  // IDAT chunk
  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createPngChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Ensure public directory exists
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// 1. Copy Amaze times.jpg to public if present in root
if (fs.existsSync('Amaze times.jpg')) {
  fs.copyFileSync('Amaze times.jpg', 'public/Amaze times.jpg');
  console.log('✓ Copied Amaze times.jpg to public/Amaze times.jpg');
}

// 2. Generate icon-192.png, icon-512.png, apple-touch-icon.png
const png192 = generatePng(192);
fs.writeFileSync('public/icon-192.png', png192);
console.log('✓ Generated public/icon-192.png (192x192, valid PNG)');

const png512 = generatePng(512);
fs.writeFileSync('public/icon-512.png', png512);
console.log('✓ Generated public/icon-512.png (512x512, valid PNG)');

fs.writeFileSync('public/apple-touch-icon.png', png192);
console.log('✓ Generated public/apple-touch-icon.png');

// 3. Generate SVG vector icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#DC2626"/>
  <circle cx="256" cy="256" r="210" fill="#0F172A" stroke="#F59E0B" stroke-width="16"/>
  <text x="256" y="275" font-family="'Noto Serif Tamil', serif, sans-serif" font-size="160" font-weight="900" fill="#F8FAFC" text-anchor="middle" dominant-baseline="middle">அ</text>
  <text x="256" y="380" font-family="sans-serif" font-size="34" font-weight="800" fill="#F59E0B" text-anchor="middle" letter-spacing="4">AMAZE TIMES</text>
</svg>`;
fs.writeFileSync('public/icon.svg', svgIcon);
console.log('✓ Generated public/icon.svg');
