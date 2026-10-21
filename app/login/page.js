'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';

export default function Login() {
  const router = useRouter();
  const [reg, setReg] = useState(false); const [f, setF] = useState({ username: '', email: '', senha: '' }); const [erro, setErro] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setErro('');
    try { await api(`/api/auth/${reg ? 'register' : 'login'}`, { method: 'POST', body: f }); router.replace('/'); }
    catch (err) { setErro(err.message); }
  };
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 border-neon/50 p-6">
        <h1 className="text-center text-3xl font-extrabold tracking-widest text-neon [text-shadow:0_0_16px_rgba(255,214,10,.7)]">JOBS</h1>
        {reg && <div><label className="label">Usuário</label><input className="input" value={f.username} onChange={set('username')} required /></div>}
        <div><label className="label">E-mail</label><input type="email" className="input" value={f.email} onChange={set('email')} required /></div>
        <div><label className="label">Senha</label><input type="password" className="input" value={f.senha} onChange={set('senha')} required minLength={6} /></div>
        {erro && <p className="text-sm text-red-400">{erro}</p>}
        <button className="btn w-full">{reg ? 'Criar conta' : 'Entrar'}</button>
        <button type="button" className="w-full text-sm text-white/60 hover:text-neon" onClick={() => { setReg(!reg); setErro(''); }}>{reg ? 'Já tenho conta' : 'Criar uma conta'}</button>
      </form>
    </div>
  );
}
