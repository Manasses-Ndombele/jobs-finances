import { sql } from '@/lib/db';
import { getUserId, json, unauth } from '@/lib/auth';

export async function PUT(req, { params }) {
  const u = await getUserId(); if (!u) return unauth();
  const b = await req.json();
  if (!b.objetivo || !(Number(b.valor) > 0)) return json({ erro: 'Dados inválidos.' }, 400);
  const [r] = await sql`UPDATE metas SET valor=${Number(b.valor)}, objetivo=${b.objetivo}, prazo=${b.prazo || null}, valor_atual=${Number(b.valor_atual) || 0} WHERE id=${params.id} AND usuario_id=${u} RETURNING *`;
  return r ? json(r) : json({ erro: 'Não encontrada.' }, 404);
}
export async function DELETE(_, { params }) {
  const u = await getUserId(); if (!u) return unauth();
  await sql`DELETE FROM metas WHERE id=${params.id} AND usuario_id=${u}`;
  return json({ ok: true });
}
