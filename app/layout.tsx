import type { Metadata, Viewport } from 'next';
// Fontes servidas pelo próprio app (sem requisição a terceiros).
import '@fontsource-variable/figtree/wght.css';
import '@fontsource/jetbrains-mono/600.css';
import './globals.css';
export const metadata: Metadata = {title:'Painel de Estudos',description:'Plano de estudos, prática com correção, tutor com IA e acompanhamento do progresso para o 8º ano.',icons:{icon:'/favicon.svg'}};
export const viewport: Viewport = {themeColor:'#0a0a0d',width:'device-width',initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="pt-BR"><body>{children}</body></html>}
