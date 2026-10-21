import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { getUserId, endSession, json, unauth } from '@/lib/auth';

export async function GET() {
  const id = await getUserId(); if (!id) return unauth();
  const [u] = await sql`SELECT id, username, email, foto, criado_em FROM usuarios WHERE id=${id}`;
  return u ? json(u) : unauth();
}
export async function PATCH(req) {
  const id = await getUserId(); if (!id) return unauth();
  const b = await req.json();
  try {
    await sql`UPDATE usuarios SET username=${b.username}, email=${b.email.toLowerCase()}, foto=${b.foto || null} WHERE id=${id}`;
    if (b.senha) {
      if (b.senha.length < 6) return json({ erro: 'Senha com 6+ caracteres.' }, 400);
      await sql`UPDATE usuarios SET senha_hash=${await bcrypt.hash(b.senha, 10)} WHERE id=${id}`;
    }
    return json({ ok: true });
  } catch { return json({ erro: 'Usuário ou e-mail já em uso.' }, 409); }
}
export async function DELETE() {
  const id = await getUserId(); if (!id) return unauth();
  await sql`DELETE FROM usuarios WHERE id=${id}`; endSession();
  return json({ ok: true });
}
