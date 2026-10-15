import { query } from './db.js';

async function run() {
  try {
    console.log('🔄 Updating users table constraints in Neon PostgreSQL...');
    await query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await query(`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'reporter', 'reader', 'user', 'editor'))`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'local'`);
    console.log('✅ Users table constraint and provider column updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Schema update error:', err);
    process.exit(1);
  }
}

run();
