import { sql } from '@/lib/db';
import { getUserId, json, unauth } from '@/lib/auth';

export async function GET(req) {
  const u = await getUserId(); if (!u) return unauth();
  const p = new URL(req.url).searchParams;
  const from = p.get('from') || '1970-01-01', to = p.get('to') || '2999-01-01', ent = p.get('entidade');
  const rows = ent
    ? await sql`SELECT m.*, e.nome AS entidade_nome FROM movimentos m JOIN entidades e ON e.id=m.fonte WHERE m.usuario_id=${u} AND m.fonte=${ent} AND m.data_hora>=${from} AND m.data_hora<${to} ORDER BY m.data_hora DESC`
    : await sql`SELECT m.*, e.nome AS entidade_nome FROM movimentos m JOIN entidades e ON e.id=m.fonte WHERE m.usuario_id=${u} AND m.data_hora>=${from} AND m.data_hora<${to} ORDER BY m.data_hora DESC`;
  return json(rows);
}
export async function POST(req) {
  const u = await getUserId(); if (!u) return unauth();
  const b = await req.json();
  const valor = Number(b.valor), imp = Number(b.impulsividade ?? 0);
  if (!['ENTRADA', 'SAÍDA'].includes(b.tipo) || !(valor > 0) || !['DESNECESSÁRIO', 'BAIXA', 'ESSENCIAL'].includes(b.necessidade) || !(imp >= 0 && imp <= 100))
    return json({ erro: 'Dados do movimento inválidos.' }, 400);
  const [e] = await sql`SELECT id FROM entidades WHERE id=${b.fonte} AND usuario_id=${u}`;
  if (!e) return json({ erro: 'Entidade não encontrada.' }, 404);
  const delta = b.tipo === 'ENTRADA' ? valor : -valor;
  const [[m]] = await sql.transaction([
    sql`INSERT INTO movimentos(usuario_id,fonte,tipo,valor,necessidade,impulsividade) VALUES(${u},${b.fonte},${b.tipo},${valor},${b.necessidade},${Math.round(imp)}) RETURNING *`,
    sql`UPDATE entidades SET saldo = saldo + ${delta} WHERE id=${b.fonte}`
  ]);
  return json(m, 201);
}
