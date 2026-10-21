// Uso: DATABASE_URL=... node scripts/init-db.mjs   (ou cole schema.sql no SQL Editor do Neon)
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
const sql = neon(process.env.DATABASE_URL);
const stmts = readFileSync(new URL('../schema.sql', import.meta.url), 'utf8').split(';').map(s => s.trim()).filter(Boolean);
for (const s of stmts) await sql(s);
console.log('Tabelas criadas.');
