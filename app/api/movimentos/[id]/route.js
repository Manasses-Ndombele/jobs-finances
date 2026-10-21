import { sql } from '@/lib/db';
import { getUserId, json, unauth } from '@/lib/auth';

// Sem PUT: movimentos não podem ser editados. Ao apagar, o saldo da entidade é revertido.
export async function DELETE(_, { params }) {
  const u = await getUserId(); if (!u) return unauth();
  const [m] = await sql`SELECT * FROM movimentos WHERE id=${params.id} AND usuario_id=${u}`;
  if (!m) return json({ erro: 'Não encontrado.' }, 404);
  const rev = m.tipo === 'ENTRADA' ? -Number(m.valor) : Number(m.valor);
  await sql.transaction([
    sql`DELETE FROM movimentos WHERE id=${m.id}`,
    sql`UPDATE entidades SET saldo = saldo + ${rev} WHERE id=${m.fonte}`
  ]);
  return json({ ok: true });
}
