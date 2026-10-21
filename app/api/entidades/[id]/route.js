import { sql } from '@/lib/db';
import { getUserId, json, unauth } from '@/lib/auth';
const CATS = ['Empresa', 'Negócios', 'Renda Extra'];

export async function PUT(req, { params }) {
  const u = await getUserId(); if (!u) return unauth();
  const b = await req.json();
  if (!b.nome || !CATS.includes(b.categoria)) return json({ erro: 'Dados inválidos.' }, 400);
  const [r] = await sql`UPDATE entidades SET nome=${b.nome}, categoria=${b.categoria}, foto=${b.foto || null}, saldo=${Number(b.saldo) || 0} WHERE id=${params.id} AND usuario_id=${u} RETURNING *`;
  return r ? json(r) : json({ erro: 'Não encontrada.' }, 404);
}
export async function DELETE(_, { params }) {
  const u = await getUserId(); if (!u) return unauth();
  await sql`DELETE FROM entidades WHERE id=${params.id} AND usuario_id=${u}`;
  return json({ ok: true });
}
