import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function optimizeImagesHighRes() {
  const srcDir = path.resolve('public/news_images_307');
  const dstDir = path.resolve('public/news_images_pdf');
  if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  console.log(`Optimizing ${files.length} images to High-Res (1400px, 86% quality)...`);

  let completed = 0;
  const concurrency = 8;
  let idx = 0;

  async function worker() {
    while (idx < files.length) {
      const file = files[idx++];
      const srcPath = path.join(srcDir, file);
      const dstPath = path.join(dstDir, file.replace(/\.png$/, '.jpg'));

      try {
        await sharp(srcPath)
          .resize({ width: 1400, withoutEnlargement: true })
          .jpeg({ quality: 86, progressive: true })
          .toFile(dstPath);
        completed++;
      } catch (err) {
        try {
          fs.copyFileSync(srcPath, dstPath);
          completed++;
        } catch (_) {}
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  let totalSize = 0;
  const dstFiles = fs.readdirSync(dstDir);
  dstFiles.forEach(f => {
    totalSize += fs.statSync(path.join(dstDir, f)).size;
  });

  console.log(`High-Res optimization complete! ${dstFiles.length} images.`);
  console.log(`Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
}

optimizeImagesHighRes().catch(console.error);

