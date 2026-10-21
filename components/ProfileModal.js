'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import ConfirmModal from './ConfirmModal';
import { api } from '@/lib/client';

export default function ProfileModal({ user, onClose, onSaved }) {
  const router = useRouter();
  const [f, setF] = useState({ username: user.username, email: user.email, foto: user.foto || '', senha: '' });
  const [msg, setMsg] = useState(''); const [del, setDel] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const save = async e => {
    e.preventDefault();
    try { await api('/api/me', { method: 'PATCH', body: f }); setMsg('Perfil atualizado.'); onSaved(); }
    catch (err) { setMsg(err.message); }
  };
  const remove = async () => { await api('/api/me', { method: 'DELETE' }); router.replace('/login'); };
  return (
    <>
      <Modal title="Meu perfil" onClose={onClose}>
        <div className="mb-4 flex items-center gap-3">
          {f.foto ? <img src={f.foto} alt="" className="h-14 w-14 rounded-full border border-neon object-cover" /> : <div className="grid h-14 w-14 place-items-center rounded-full border border-neon text-xl text-neon">{user.username[0]?.toUpperCase()}</div>}
          <div className="text-xs text-white/60">Membro desde {new Date(user.criado_em).toLocaleDateString('pt-BR')}</div>
        </div>
        <form onSubmit={save} className="space-y-3">
          <div><label className="label">Usuário</label><input className="input" value={f.username} onChange={set('username')} required /></div>
          <div><label className="label">E-mail</label><input type="email" className="input" value={f.email} onChange={set('email')} required /></div>
          <div><label className="label">Foto de perfil (link do Cloudinary)</label><input className="input" value={f.foto} onChange={set('foto')} placeholder="https://res.cloudinary.com/..." /></div>
          <div><label className="label">Nova senha (deixe vazio para manter)</label><input type="password" className="input" value={f.senha} onChange={set('senha')} minLength={6} /></div>
          {msg && <p className="text-sm text-neon">{msg}</p>}
          <div className="flex justify-between pt-2">
            <button type="button" className="btn-danger" onClick={() => setDel(true)}>Eliminar conta</button>
            <button className="btn">Salvar alterações</button>
          </div>
        </form>
      </Modal>
      {del && <ConfirmModal title="Eliminar conta" text="Isso apaga sua conta e todos os seus dados (entidades, movimentos e metas). Não dá para desfazer." onConfirm={remove} onClose={() => setDel(false)} />}
    </>
  );
}
