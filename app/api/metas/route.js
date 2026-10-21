import { sql } from '@/lib/db';
import { getUserId, json, unauth } from '@/lib/auth';

export async function GET() {
  const u = await getUserId(); if (!u) return unauth();
  return json(await sql`SELECT * FROM metas WHERE usuario_id=${u} ORDER BY prazo NULLS LAST, id`);
}
export async function POST(req) {
  const u = await getUserId(); if (!u) return unauth();
  const b = await req.json();
  if (!b.objetivo || !(Number(b.valor) > 0)) return json({ erro: 'Objetivo e valor são obrigatórios.' }, 400);
  const [r] = await sql`INSERT INTO metas(usuario_id,valor,objetivo,prazo,valor_atual) VALUES(${u},${Number(b.valor)},${b.objetivo},${b.prazo || null},${Number(b.valor_atual) || 0}) RETURNING *`;
  return json(r, 201);
}
