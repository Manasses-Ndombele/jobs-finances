import './globals.css';
import { Sora } from 'next/font/google';
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata = { title: 'JOBS', description: 'Gestão financeira das suas fontes de renda' };
export default function RootLayout({ children }) {
  return (<html lang="pt-BR" className={sora.variable}><body>{children}</body></html>);
}
