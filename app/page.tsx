'use client';
import {useCallback,useEffect,useState} from 'react';
import {LogOut} from 'lucide-react';
import {json,readJSON,type User} from '../components/painel/shared';
import {Landing} from '../components/painel/Landing';
import {Dashboard} from '../components/painel/Dashboard';

export default function Home(){
 const [user,setUser]=useState<User|null>(null);
 const [checking,setChecking]=useState(true),[signupOpen,setSignupOpen]=useState(true);
 useEffect(()=>{fetch('/api/auth').then(readJSON).then(x=>{setUser((x.user as User)||null);setSignupOpen(x.signupOpen!==false)}).catch(()=>setUser(null)).finally(()=>setChecking(false))},[]);
 const expire=useCallback(()=>setUser(null),[]);
 async function logout(){await fetch('/api/auth',{method:'POST',headers:json,body:JSON.stringify({op:'logout'})}).catch(()=>{});setUser(null)}
 return <>
  <div className="stars" aria-hidden="true"/>
  <header className="top"><div className="wrap nav">
   <a className="logo" href="#"><span className="logo-mark">✦</span> Painel <b>de Estudos</b></a>
   {user?<div className="nav-user"><span className="avatar" aria-hidden="true">{user.name.slice(0,1).toUpperCase()}</span><span className="who">{user.name}</span><button className="icon-btn" aria-label="Sair" title="Sair" onClick={logout}><LogOut size={16}/></button></div>
    :!checking&&<a className="btn sm secondary" href="#entrar">Entrar</a>}
  </div></header>
  <main className="wrap">
   {checking?<p className="note center" style={{padding:'80px 0'}} role="status">Carregando…</p>:user?<Dashboard key={user.id} name={user.name} onExpired={expire}/>:<Landing onLogin={setUser} signupOpen={signupOpen}/>}
  </main>
  <footer className="footer">Painel de Estudos · 8º ano · <a href="https://basenacionalcomum.mec.gov.br/" target="_blank" rel="noreferrer">Referência curricular: BNCC</a></footer>
 </>;
}
