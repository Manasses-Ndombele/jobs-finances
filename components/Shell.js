'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, BarChart3, Target, User, LogOut } from 'lucide-react';
import ProfileModal from './ProfileModal';
import { api } from '@/lib/client';

const links = [{ href: '/', label: 'Home', Icon: Home }, { href: '/dashboard', label: 'Dashboard', Icon: BarChart3 }, { href: '/metas', label: 'Metas', Icon: Target }];

export default function Shell({ children }) {
  const path = usePathname(), router = useRouter();
  const [user, setUser] = useState(null); const [perfil, setPerfil] = useState(false);
  const load = () => api('/api/me').then(setUser).catch(() => router.replace('/login'));
  useEffect(() => { load(); }, []);
  const logout = async () => { await api('/api/auth/logout', { method: 'POST' }); router.replace('/login'); };
  if (!user) return <div className="grid min-h-screen place-items-center text-neon">Carregando…</div>;
  const item = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-neon/10';
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-neon/25 bg-black p-2 md:w-56 md:p-4">
        <div className="mb-8 px-1 text-xl font-extrabold tracking-widest text-neon [text-shadow:0_0_14px_rgba(255,214,10,.7)]"><span className="md:hidden">J</span><span className="hidden md:inline">JOBS</span></div>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={`${item} ${path === href ? 'bg-neon/15 text-neon' : 'text-white/80'}`}><Icon size={18} /><span className="hidden md:inline">{label}</span></Link>
          ))}
          <button onClick={() => setPerfil(true)} className={`${item} text-white/80`}><User size={18} /><span className="hidden md:inline">Perfil</span></button>
        </nav>
        <button onClick={logout} className={`${item} text-white/50`}><LogOut size={18} /><span className="hidden md:inline">Sair</span></button>
      </aside>
      <main className="ml-16 p-4 md:ml-56 md:p-8">{children}</main>
      {perfil && <ProfileModal user={user} onClose={() => setPerfil(false)} onSaved={load} />}
    </div>
  );
}
