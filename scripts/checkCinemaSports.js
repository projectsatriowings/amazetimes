import db from '../server/db.js';

async function main() {
  const c = await db.query("SELECT id, title, category, sub_category, tags, main_image, created_at FROM news WHERE category = 'சினிமா' OR category ILIKE '%சினிமா%' ORDER BY created_at DESC LIMIT 6");
  console.log('CURRENT CINEMA NEWS IN DB:');
  console.log(c.rows);

  const s = await db.query("SELECT id, title, category, sub_category, tags, main_image, created_at FROM news WHERE category = 'விளையாட்டு' OR category ILIKE '%விளையாட்டு%' ORDER BY created_at DESC LIMIT 6");
  console.log('CURRENT SPORTS NEWS IN DB:');
  console.log(s.rows);

  const settings = await db.query("SELECT key, value FROM site_settings WHERE key IN ('cinema_buzz_settings', 'sports_buzz_settings')");
  console.log('SETTINGS IN DB:', settings.rows);

  process.exit(0);
}

main().catch(console.error);
