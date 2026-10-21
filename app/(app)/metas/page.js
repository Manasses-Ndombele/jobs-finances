'use client';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import { api, kz } from '@/lib/client';

export default function Metas() {
  const [metas, setMetas] = useState([]); const [form, setForm] = useState(null); const [del, setDel] = useState(null);
  const load = () => api('/api/metas').then(setMetas);
  useEffect(() => { load(); }, []);
  const remove = async () => { await api(`/api/metas/${del.id}`, { method: 'DELETE' }); setDel(null); load(); };
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Metas</h1><button className="btn flex items-center gap-1" onClick={() => setForm({})}><Plus size={16} />Nova meta</button></div>
      {metas.length === 0 && <p className="card text-sm text-white/60">Nenhuma meta ainda. Defina um objetivo financeiro e acompanhe o progresso.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {metas.map(m => {
          const atual = Math.min(Number(m.valor_atual), Number(m.valor)), falta = Math.max(Number(m.valor) - Number(m.valor_atual), 0);
          const pct = Math.round((Number(m.valor_atual) / Number(m.valor)) * 100);
          return (
            <div key={m.id} className="card">
              <div className="flex items-start gap-2"><p className="flex-1 text-sm text-white/80">{m.objetivo}</p>
                <button aria-label="Editar" onClick={() => setForm(m)} className="text-white/60 hover:text-neon"><Pencil size={16} /></button>
                <button aria-label="Excluir" onClick={() => setDel(m)} className="text-white/60 hover:text-red-400"><Trash2 size={16} /></button></div>
              <div className="relative h-48">
                <ResponsiveContainer><PieChart><Pie data={[{ n: 'Juntado', v: atual }, { n: 'Falta', v: falta }]} dataKey="v" nameKey="n" innerRadius={55} outerRadius={80} stroke="none"><Cell fill="#FFD60A" /><Cell fill="#2A2A2A" /></Pie><Tooltip formatter={v => kz(v)} contentStyle={{ background: '#000', border: '1px solid #FFD60A66' }} itemStyle={{ color: '#fff' }} /></PieChart></ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-2xl font-bold text-neon">{pct}%</div>
              </div>
              <div className="flex justify-between text-sm"><span>{kz(m.valor_atual)} <span className="text-white/50">de {kz(m.valor)}</span></span>{m.prazo && <span className="text-white/50">até {new Date(m.prazo).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>}</div>
            </div>
          );
        })}
      </div>
      {form && <MetaForm meta={form} onClose={() => setForm(null)} onSaved={() => { setForm(null); load(); }} />}
      {del && <ConfirmModal text="Eliminar esta meta?" onConfirm={remove} onClose={() => setDel(null)} />}
    </div>
  );
}

function MetaForm({ meta, onClose, onSaved }) {
  const [f, setF] = useState({ objetivo: meta.objetivo || '', valor: meta.valor || '', valor_atual: meta.valor_atual ?? 0, prazo: meta.prazo ? String(meta.prazo).slice(0, 10) : '' });
  const [erro, setErro] = useState(''); const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => { e.preventDefault(); try { await api(meta.id ? `/api/metas/${meta.id}` : '/api/metas', { method: meta.id ? 'PUT' : 'POST', body: f }); onSaved(); } catch (err) { setErro(err.message); } };
  return (
    <Modal title={meta.id ? 'Editar meta' : 'Nova meta'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div><label className="label">Objetivo</label><textarea className="input min-h-24" value={f.objetivo} onChange={set('objetivo')} required /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Valor da meta</label><input type="number" step="0.01" min="0.01" className="input" value={f.valor} onChange={set('valor')} required /></div>
          <div><label className="label">Valor atual</label><input type="number" step="0.01" min="0" className="input" value={f.valor_atual} onChange={set('valor_atual')} /></div>
        </div>
        <div><label className="label">Prazo</label><input type="date" className="input" value={f.prazo} onChange={set('prazo')} /></div>
        {erro && <p className="text-sm text-red-400">{erro}</p>}
        <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn">Salvar</button></div>
      </form>
    </Modal>
  );
}
