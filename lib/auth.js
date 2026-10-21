import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const key = () => new TextEncoder().encode(process.env.JWT_SECRET);
export async function createSession(id) {
  const t = await new SignJWT({ id }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(key());
  cookies().set('jobs_token', t, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 604800, secure: process.env.NODE_ENV === 'production' });
}
export function endSession() { cookies().delete('jobs_token'); }
export async function getUserId() {
  const t = cookies().get('jobs_token')?.value;
  if (!t) return null;
  try { return (await jwtVerify(t, key())).payload.id; } catch { return null; }
}
export const json = (d, status = 200) => Response.json(d, { status });
export const unauth = () => json({ erro: 'Não autenticado.' }, 401);
