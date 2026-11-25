import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderSeoHtml } from '../server/services/seoRenderer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSeo() {
  console.log('🔍 Running Comprehensive SEO Verification Suite...');
  const templatePath = path.join(__dirname, '../index.html');
  const rawHtml = fs.readFileSync(templatePath, 'utf-8');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  // 1. Homepage Test
  console.log('\n--- 1. Testing Homepage SSR ---');
  const homeHtml = await renderSeoHtml({ path: '/' }, rawHtml);

  // Hreflang check
  assert(homeHtml.includes('hreflang="ta" href="https://amazetimes.com/"'), 'Home hreflang ta points to home');
  assert(homeHtml.includes('hreflang="ta-IN" href="https://amazetimes.com/"'), 'Home hreflang ta-IN points to home');
  assert(homeHtml.includes('hreflang="x-default" href="https://amazetimes.com/"'), 'Home hreflang x-default points to home');

  // Title check
  const homeTitle = (homeHtml.match(/<title>(.*?)<\/title>/) || [])[1] || '';
  assert(homeTitle.length >= 30 && homeTitle.length <= 60, `Home title length (${homeTitle.length} chars) is 30-60`, homeTitle);

  // Meta Description check
  const homeDesc = (homeHtml.match(/<meta\s+name="description"\s+content="([^"]*)"/) || [])[1] || '';
  assert(homeDesc.length > 50 && homeDesc.length <= 155, `Home meta desc length (${homeDesc.length} chars) <= 155`, homeDesc);

  // H1 check
  const homeH1s = homeHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const homeH1Text = homeH1s.length ? homeH1s[0].replace(/<[^>]+>/g, '').trim() : '';
  assert(homeH1s.length === 1, `Home has exactly 1 H1 (found ${homeH1s.length})`);
  assert(homeH1Text.length > 0 && homeH1Text.length <= 70, `Home H1 length (${homeH1Text.length} chars) <= 70`, homeH1Text);

  // H2 check
  const homeH2s = homeHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
  assert(homeH2s.length === 1, `Home has exactly 1 H2 (found ${homeH2s.length})`);

  // 2. Category Page Test (Tamil Nadu)
  console.log('\n--- 2. Testing Category SSR (/category/tamilnadu) ---');
  const catHtml = await renderSeoHtml({ path: '/category/tamilnadu' }, rawHtml);

  // Hreflang check (self-referencing!)
  assert(catHtml.includes('hreflang="ta" href="https://amazetimes.com/category/tamilnadu"'), 'Category hreflang ta self-references category page');
  assert(catHtml.includes('hreflang="ta-IN" href="https://amazetimes.com/category/tamilnadu"'), 'Category hreflang ta-IN self-references category page');
  assert(catHtml.includes('hreflang="x-default" href="https://amazetimes.com/category/tamilnadu"'), 'Category hreflang x-default self-references category page');

  // Title check
  const catTitle = (catHtml.match(/<title>(.*?)<\/title>/) || [])[1] || '';
  assert(catTitle.length >= 30 && catTitle.length <= 60, `Category title length (${catTitle.length} chars) is 30-60`, catTitle);

  // Meta Description check
  const catDesc = (catHtml.match(/<meta\s+name="description"\s+content="([^"]*)"/) || [])[1] || '';
  assert(catDesc.length > 50 && catDesc.length <= 155, `Category meta desc length (${catDesc.length} chars) <= 155`, catDesc);

  // H1 check
  const catH1s = catHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const catH1Text = catH1s.length ? catH1s[0].replace(/<[^>]+>/g, '').trim() : '';
  assert(catH1s.length === 1, `Category has exactly 1 H1 (found ${catH1s.length})`);
  assert(catH1Text.length > 0 && catH1Text.length <= 70, `Category H1 length (${catH1Text.length} chars) <= 70`, catH1Text);

  // H2 check
  const catH2s = catHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
  assert(catH2s.length === 1, `Category has exactly 1 H2 (found ${catH2s.length})`);

  // 3. Article SSR Test
  console.log('\n--- 3. Testing Article SSR ---');
  // Pass simulated article request
  const artHtml = await renderSeoHtml({ path: '/news/tamilnadu/article-474', query: { article: '474' } }, rawHtml);

  // Hreflang check (self-referencing!)
  assert(artHtml.includes('hreflang="ta" href="https://amazetimes.com/news/tamilnadu/article-474"'), 'Article hreflang ta self-references article page');
  assert(artHtml.includes('hreflang="ta-IN" href="https://amazetimes.com/news/tamilnadu/article-474"'), 'Article hreflang ta-IN self-references article page');
  assert(artHtml.includes('hreflang="x-default" href="https://amazetimes.com/news/tamilnadu/article-474"'), 'Article hreflang x-default self-references article page');

  // Title check
  const artTitle = (artHtml.match(/<title>(.*?)<\/title>/) || [])[1] || '';
  assert(artTitle.length >= 30 && artTitle.length <= 60, `Article title length (${artTitle.length} chars) is 30-60`, artTitle);

  // Meta Description check
  const artDesc = (artHtml.match(/<meta\s+name="description"\s+content="([^"]*)"/) || [])[1] || '';
  assert(artDesc.length > 30 && artDesc.length <= 155, `Article meta desc length (${artDesc.length} chars) <= 155`, artDesc);

  // H1 check
  const artH1s = artHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const artH1Text = artH1s.length ? artH1s[0].replace(/<[^>]+>/g, '').trim() : '';
  assert(artH1s.length === 1, `Article has exactly 1 H1 (found ${artH1s.length})`);
  assert(artH1Text.length > 0 && artH1Text.length <= 70, `Article H1 length (${artH1Text.length} chars) <= 70`, artH1Text);

  // H2 check
  const artH2s = artHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
  assert(artH2s.length === 1, `Article has exactly 1 H2 (found ${artH2s.length})`);
  assert(!artH2s[0].includes('தொடர்புடைய முக்கியச் செய்திகள் (Related Tamil News)'), 'Article H2 is unique, not the old generic duplicate string');

  // Image audit checks (Issues H, I, J)
  const imgMatches = artHtml.match(/<img[^>]+>/gi) || [];
  const articleImg = imgMatches.find(img => img.includes('width="1200"'));
  assert(!!articleImg, 'Article main image rendered with width="1200"');
  if (articleImg) {
    const altMatch = articleImg.match(/alt="([^"]*)"/);
    const titleMatch = articleImg.match(/title="([^"]*)"/);
    const widthMatch = articleImg.match(/width="([^"]*)"/);
    const heightMatch = articleImg.match(/height="([^"]*)"/);

    assert(!!altMatch && altMatch[1].length <= 100, `Article image alt length (${altMatch ? altMatch[1].length : 0} chars) <= 100`);
    assert(!!titleMatch && titleMatch[1].length > 0, `Article image has title attribute: "${titleMatch ? titleMatch[1] : ''}"`);
    assert(!!widthMatch && !!heightMatch, 'Article image has width & height attributes');
  }

  // 4. Public Web Images Check (< 100 kB)
  console.log('\n--- 4. Checking Public Web Image Sizes ---');
  const webImages = ['public/icon-512.png', 'public/icon-192.png', 'public/og-image.jpg', 'public/amaze-times-logo.webp'];
  for (const imgPath of webImages) {
    if (fs.existsSync(imgPath)) {
      const sz = fs.statSync(imgPath).size;
      assert(sz < 100000, `${imgPath} size (${(sz / 1024).toFixed(1)} kB) < 100 kB`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Verification Complete: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);
  process.exit(failed > 0 ? 1 : 0);
}

testSeo().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
