'use client';
import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { api, kz, isoDay } from '@/lib/client';

const COLORS = ['#FFD60A', '#FFFFFF', '#FF9F0A', '#A3A3A3', '#FFF176', '#CA8A04'];
const tip = { contentStyle: { background: '#000', border: '1px solid #FFD60A66', borderRadius: 8 }, labelStyle: { color: '#FFD60A' } };

export default function Dashboard() {
  const [from, setFrom] = useState(isoDay(Date.now() - 29 * 864e5));
  const [to, setTo] = useState(isoDay(new Date()));
  const [ents, setEnts] = useState([]); const [movs, setMovs] = useState([]);

  useEffect(() => { api('/api/entidades').then(setEnts); }, []);
  useEffect(() => {
    const b = new Date(to + 'T00:00:00'); b.setDate(b.getDate() + 1);
    api(`/api/movimentos?from=${new Date(from + 'T00:00:00').toISOString()}&to=${b.toISOString()}`).then(setMovs);
  }, [from, to]);

  const { growth, flow, totIn, totOut } = useMemo(() => {
    const days = []; for (let d = new Date(from + 'T00:00:00'); isoDay(d) <= to; d.setDate(d.getDate() + 1)) days.push(isoDay(d));
    const net = {}, io = {}; let totIn = 0, totOut = 0;
    movs.forEach(m => {
      const k = isoDay(m.data_hora), v = Number(m.valor), s = m.tipo === 'ENTRADA' ? v : -v;
      net[`${k}|${m.entidade_nome}`] = (net[`${k}|${m.entidade_nome}`] || 0) + s;
      io[k] = io[k] || { entradas: 0, saidas: 0 };
      if (s > 0) { io[k].entradas += v; totIn += v; } else { io[k].saidas += v; totOut += v; }
    });
    const acc = {}; ents.forEach(e => acc[e.nome] = 0);
    const growth = days.map(d => { const row = { dia: d.slice(5).split('-').reverse().join('/') }; ents.forEach(e => { acc[e.nome] += net[`${d}|${e.nome}`] || 0; row[e.nome] = +acc[e.nome].toFixed(2); }); return row; });
    const flow = days.map(d => ({ dia: d.slice(5).split('-').reverse().join('/'), entradas: io[d]?.entradas || 0, saidas: io[d]?.saidas || 0 }));
    return { growth, flow, totIn, totOut };
  }, [movs, ents, from, to]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <h1 className="mr-auto text-2xl font-bold">Dashboard</h1>
        <div><label className="label">De</label><input type="date" className="input" value={from} max={to} onChange={e => setFrom(e.target.value)} /></div>
        <div><label className="label">Até</label><input type="date" className="input" value={to} min={from} onChange={e => setTo(e.target.value)} /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card"><p className="text-sm text-white/60">Entradas</p><p className="text-2xl font-bold text-green-400">{kz(totIn)}</p></div>
        <div className="card"><p className="text-sm text-white/60">Saídas</p><p className="text-2xl font-bold text-red-400">{kz(totOut)}</p></div>
        <div className="card"><p className="text-sm text-white/60">Resultado do período</p><p className={`text-2xl font-bold ${totIn - totOut >= 0 ? 'text-neon' : 'text-red-400'}`}>{kz(totIn - totOut)}</p></div>
      </div>
      <div className="card">
        <h2 className="mb-1 font-semibold">Crescimento por entidade</h2><p className="mb-3 text-xs text-white/50">Variação acumulada do saldo no período</p>
        <div className="h-72"><ResponsiveContainer><LineChart data={growth}><CartesianGrid stroke="#FFD60A22" /><XAxis dataKey="dia" stroke="#999" fontSize={11} /><YAxis stroke="#999" fontSize={11} /><Tooltip {...tip} formatter={v => kz(v)} /><Legend />
          {ents.map((e, i) => <Line key={e.id} type="monotone" dataKey={e.nome} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />)}</LineChart></ResponsiveContainer></div>
      </div>
      <div className="card">
        <h2 className="mb-3 font-semibold">Entradas e saídas (todas as entidades)</h2>
        <div className="h-72"><ResponsiveContainer><BarChart data={flow}><CartesianGrid stroke="#FFD60A22" /><XAxis dataKey="dia" stroke="#999" fontSize={11} /><YAxis stroke="#999" fontSize={11} /><Tooltip {...tip} formatter={v => kz(v)} /><Legend />
          <Bar dataKey="entradas" fill="#FFD60A" /><Bar dataKey="saidas" fill="#FFFFFF" /></BarChart></ResponsiveContainer></div>
      </div>
    </div>
  );
}
