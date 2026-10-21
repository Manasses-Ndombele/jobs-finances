import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { createSession, endSession, json } from '@/lib/auth';

export async function POST(req, { params }) {
  if (params.action === 'logout') { endSession(); return json({ ok: true }); }
  const b = await req.json();
  if (params.action === 'register') {
    if (!b.username || !b.email || !b.senha || b.senha.length < 6) return json({ erro: 'Preencha tudo (senha com 6+ caracteres).' }, 400);
    try {
      const h = await bcrypt.hash(b.senha, 10);
      const [u] = await sql`INSERT INTO usuarios(username,email,senha_hash) VALUES(${b.username.trim()},${b.email.trim().toLowerCase()},${h}) RETURNING id`;
      await createSession(u.id);
      return json({ ok: true });
    } catch { return json({ erro: 'Usuário ou e-mail já cadastrado.' }, 409); }
  }
  if (params.action === 'login') {
    const [u] = await sql`SELECT id, senha_hash FROM usuarios WHERE email=${(b.email || '').trim().toLowerCase()}`;
    if (!u || !(await bcrypt.compare(b.senha || '', u.senha_hash))) return json({ erro: 'E-mail ou senha incorretos.' }, 401);
    await createSession(u.id);
    return json({ ok: true });
  }
  return json({ erro: 'Ação inválida.' }, 404);
}
