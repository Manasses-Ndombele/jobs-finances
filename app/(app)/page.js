'use client';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import { api, kz, isoDay, dayRange } from '@/lib/client';

const CATS = ['Empresa', 'Negócios', 'Renda Extra'];
const NEC = ['DESNECESSÁRIO', 'BAIXA', 'ESSENCIAL'];
const hoje = () => isoDay(new Date());

export default function HomePage() {
  const [ents, setEnts] = useState([]);
  const [sel, setSel] = useState('');            // '' = TODAS ENTIDADES
  const [spentDay, setSpentDay] = useState(hoje());
  const [spent, setSpent] = useState(0);
  const [modo, setModo] = useState('dia');       // dia | semana | mes
  const [feedDay, setFeedDay] = useState(hoje());
  const [feedEnt, setFeedEnt] = useState('');
  const [movs, setMovs] = useState([]);
  const [entForm, setEntForm] = useState(null);  // null | {} | entidade
  const [movForm, setMovForm] = useState(false);
  const [delMov, setDelMov] = useState(null);
  const [delEnt, setDelEnt] = useState(null);

  const loadEnts = useCallback(() => api('/api/entidades').then(setEnts), []);
  useEffect(() => { loadEnts(); }, [loadEnts]);

  const loadSpent = useCallback(async () => {
    const [a, b] = dayRange(spentDay);
    const rows = await api(`/api/movimentos?from=${a}&to=${b}${sel ? `&entidade=${sel}` : ''}`);
    setSpent(rows.filter(m => m.tipo === 'SAÍDA').reduce((s, m) => s + Number(m.valor), 0));
  }, [spentDay, sel]);
  useEffect(() => { loadSpent(); }, [loadSpent, ents]);

  const loadFeed = useCallback(async () => {
    let a, b; const t = new Date();
    if (modo === 'dia') [a, b] = dayRange(feedDay);
    else if (modo === 'semana') { [a] = dayRange(isoDay(new Date(t.getTime() - 6 * 864e5))); [, b] = dayRange(hoje()); }
    else { [a] = dayRange(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-01`); [, b] = dayRange(hoje()); }
    setMovs(await api(`/api/movimentos?from=${a}&to=${b}${feedEnt ? `&entidade=${feedEnt}` : ''}`));
  }, [modo, feedDay, feedEnt]);
  useEffect(() => { loadFeed(); }, [loadFeed, ents]);

  const saldo = sel ? Number(ents.find(e => String(e.id) === sel)?.saldo || 0) : ents.reduce((s, e) => s + Number(e.saldo), 0);
  const spentLabel = spentDay === hoje() ? 'Saldo gasto hoje' : `Saldo gasto em ${new Date(spentDay + 'T00:00:00').toLocaleDateString('pt-BR')}`;

  const refresh = () => { loadEnts(); loadFeed(); loadSpent(); };
  const removeMov = async () => { await api(`/api/movimentos/${delMov.id}`, { method: 'DELETE' }); setDelMov(null); refresh(); };
  const removeEnt = async () => { await api(`/api/entidades/${delEnt.id}`, { method: 'DELETE' }); setDelEnt(null); if (sel === String(delEnt.id)) setSel(''); refresh(); };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Resumo */}
      <section className="space-y-3">
        <div className="max-w-xs"><label className="label">Ver gasto do dia</label><input type="date" className="input" value={spentDay} onChange={e => setSpentDay(e.target.value || hoje())} /></div>
        <div className="max-w-xs">
          <select className="input" value={sel} onChange={e => setSel(e.target.value)} aria-label="Entidade">
            <option value="">TODAS ENTIDADES</option>
            {ents.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card"><p className="text-sm text-white/60">Saldo atual</p><p className="mt-1 text-3xl font-bold text-neon [text-shadow:0_0_14px_rgba(255,214,10,.5)]">{kz(saldo)}</p></div>
          <div className="card"><p className="text-sm text-white/60">{spentLabel}</p><p className="mt-1 text-3xl font-bold text-red-400">{kz(spent)}</p></div>
        </div>
      </section>

      {/* Entidades */}
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Minhas entidades</h2><button className="btn-ghost flex items-center gap-1" onClick={() => setEntForm({})}><Plus size={16} />Nova entidade</button></div>
        {ents.length === 0 && <p className="card text-sm text-white/60">Nenhuma entidade ainda. Crie sua primeira fonte de renda para começar.</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {ents.map(e => (
            <div key={e.id} className="card flex items-center gap-3">
              {e.foto ? <img src={e.foto} alt="" className="h-12 w-12 rounded-lg border border-neon/40 object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-lg border border-neon/40 text-neon">{e.nome[0]}</div>}
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{e.nome}</p><p className="text-xs text-white/50">{e.categoria} · {kz(e.saldo)}</p></div>
              <button aria-label="Editar" onClick={() => setEntForm(e)} className="text-white/60 hover:text-neon"><Pencil size={16} /></button>
              <button aria-label="Excluir" onClick={() => setDelEnt(e)} className="text-white/60 hover:text-red-400"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </section>

      {/* Feed */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">Movimentos</h2>
          <button className="btn flex items-center gap-1" disabled={!ents.length} onClick={() => setMovForm(true)}><Plus size={16} />Novo movimento</button>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {[['dia', 'Dia'], ['semana', 'Semana'], ['mes', 'Mês']].map(([k, l]) => (
            <button key={k} onClick={() => setModo(k)} className={modo === k ? 'btn' : 'btn-ghost'}>{l}</button>
          ))}
          {modo === 'dia' && <input type="date" className="input !w-auto" value={feedDay} onChange={e => setFeedDay(e.target.value || hoje())} />}
          <select className="input !w-auto" value={feedEnt} onChange={e => setFeedEnt(e.target.value)} aria-label="Filtrar entidade">
            <option value="">TODAS ENTIDADES</option>
            {ents.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>
        {movs.length === 0 && <p className="card text-sm text-white/60">Nenhum movimento neste período.</p>}
        <div className="space-y-2">
          {movs.map(m => {
            const ent = m.tipo === 'ENTRADA';
            return (
              <div key={m.id} className="card flex items-center gap-4 !py-3">
                <span className={`w-6 text-center text-3xl font-bold ${ent ? 'text-green-400' : 'text-red-500'}`}>{ent ? '+' : '-'}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-lg font-semibold ${ent ? 'text-green-400' : 'text-red-500'}`}>{kz(m.valor)}</p>
                  <p className="truncate text-xs text-white/50">{m.entidade_nome} · {new Date(m.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
                <div className="text-right text-xs"><p className="text-white/80">{m.necessidade}</p><p className="text-neon">Impulsividade {m.impulsividade}%</p></div>
                <button aria-label="Excluir movimento" onClick={() => setDelMov(m)} className="text-white/60 hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            );
          })}
        </div>
      </section>

      {entForm && <EntForm ent={entForm} onClose={() => setEntForm(null)} onSaved={() => { setEntForm(null); refresh(); }} />}
      {movForm && <MovForm ents={ents} onClose={() => setMovForm(false)} onSaved={() => { setMovForm(false); refresh(); }} />}
      {delMov && <ConfirmModal text={`Eliminar o movimento de ${kz(delMov.valor)}? O saldo da entidade será ajustado.`} onConfirm={removeMov} onClose={() => setDelMov(null)} />}
      {delEnt && <ConfirmModal text={`Eliminar "${delEnt.nome}" e todos os seus movimentos?`} onConfirm={removeEnt} onClose={() => setDelEnt(null)} />}
    </div>
  );
}

function EntForm({ ent, onClose, onSaved }) {
  const [f, setF] = useState({ nome: ent.nome || '', categoria: ent.categoria || CATS[0], foto: ent.foto || '', saldo: ent.saldo ?? 0 });
  const [erro, setErro] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    try { await api(ent.id ? `/api/entidades/${ent.id}` : '/api/entidades', { method: ent.id ? 'PUT' : 'POST', body: f }); onSaved(); }
    catch (err) { setErro(err.message); }
  };
  return (
    <Modal title={ent.id ? 'Editar entidade' : 'Nova entidade'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div><label className="label">Nome</label><input className="input" value={f.nome} onChange={set('nome')} required /></div>
        <div><label className="label">Categoria</label><select className="input" value={f.categoria} onChange={set('categoria')}>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
        <div><label className="label">Foto (link do Cloudinary)</label><input className="input" value={f.foto} onChange={set('foto')} placeholder="https://res.cloudinary.com/..." /></div>
        <div><label className="label">Saldo em caixa</label><input type="number" step="0.01" className="input" value={f.saldo} onChange={set('saldo')} /></div>
        {erro && <p className="text-sm text-red-400">{erro}</p>}
        <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn">Salvar</button></div>
      </form>
    </Modal>
  );
}

function MovForm({ ents, onClose, onSaved }) {
  const [f, setF] = useState({ tipo: 'SAÍDA', valor: '', fonte: ents[0]?.id, necessidade: 'BAIXA', impulsividade: 0 });
  const [erro, setErro] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    try { await api('/api/movimentos', { method: 'POST', body: f }); onSaved(); } catch (err) { setErro(err.message); }
  };
  return (
    <Modal title="Novo movimento" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">{['ENTRADA', 'SAÍDA'].map(t => <button type="button" key={t} onClick={() => setF({ ...f, tipo: t })} className={f.tipo === t ? 'btn' : 'btn-ghost'}>{t}</button>)}</div>
        <div><label className="label">Valor</label><input type="number" step="0.01" min="0.01" className="input" value={f.valor} onChange={set('valor')} required /></div>
        <div><label className="label">Fonte (entidade)</label><select className="input" value={f.fonte} onChange={set('fonte')}>{ents.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}</select></div>
        <div><label className="label">Necessidade</label><select className="input" value={f.necessidade} onChange={set('necessidade')}>{NEC.map(n => <option key={n}>{n}</option>)}</select></div>
        <div><label className="label">Impulsividade: {f.impulsividade}%</label><input type="range" min="0" max="100" className="w-full accent-[#FFD60A]" value={f.impulsividade} onChange={set('impulsividade')} /></div>
        {erro && <p className="text-sm text-red-400">{erro}</p>}
        <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn">Registrar</button></div>
      </form>
    </Modal>
  );
}
