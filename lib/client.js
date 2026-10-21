export async function api(url, opts = {}) {
  const r = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json' }, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.erro || 'Erro inesperado.'), { status: r.status });
  return d;
}
export const kz = n => Number(n || 0).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' });
export const isoDay = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
export const dayRange = (s, days = 1) => { const a = new Date(s + 'T00:00:00'), b = new Date(a); b.setDate(b.getDate() + days); return [a.toISOString(), b.toISOString()]; };
