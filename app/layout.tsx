import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Painel de Estudos',description:'Organize materiais, plano, questões e progresso.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="pt-BR"><body>{children}</body></html>}
