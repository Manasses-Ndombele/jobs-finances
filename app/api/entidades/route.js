import { sql } from '@/lib/db';
import { getUserId, json, unauth } from '@/lib/auth';
export const CATS = ['Empresa', 'Negócios', 'Renda Extra'];

export async function GET() {
  const u = await getUserId(); if (!u) return unauth();
  return json(await sql`SELECT * FROM entidades WHERE usuario_id=${u} ORDER BY nome`);
}
export async function POST(req) {
  const u = await getUserId(); if (!u) return unauth();
  const b = await req.json();
  if (!b.nome || !CATS.includes(b.categoria)) return json({ erro: 'Nome e categoria válida são obrigatórios.' }, 400);
  const [r] = await sql`INSERT INTO entidades(usuario_id,nome,categoria,foto,saldo) VALUES(${u},${b.nome},${b.categoria},${b.foto || null},${Number(b.saldo) || 0}) RETURNING *`;
  return json(r, 201);
}
