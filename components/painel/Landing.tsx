'use client';
import {useState} from 'react';
import {Layers,Pencil,MessageCircle,Repeat,Headphones,ListChecks,GraduationCap,Camera,Plus,Mic,ArrowUp,Check} from 'lucide-react';
import {Orb,Segmented,Spark,errorOf,json,readJSON,type User} from './shared';
import {ScanIllustration} from './MaterialsSection';

const previewTiles=[
 {label:'Flashcards',icon:<Layers size={16}/>},{label:'Simulado',icon:<GraduationCap size={18}/>,big:true},{label:'Exercícios',icon:<Pencil size={16}/>},
 {label:'Chat',icon:<MessageCircle size={16}/>},{label:'Quiz',icon:<ListChecks size={18}/>,big:true},{label:'Revisão',icon:<Repeat size={16}/>},
];

export function Landing({onLogin}:{onLogin:(u:User)=>void}){
 const [kind,setKind]=useState<'oral'|'escrito'>('oral');
 return <div className="landing">
  <section className="hero">
   <span className="eyebrow">8º ano · Ensino Fundamental</span>
   <h1 className="display hero-title"><span className="dim">Estude com método.</span> Chegue na prova com segurança.</h1>
   <p className="lead">Plano semanal, prática com correção na hora, tutor com IA e acompanhamento do seu progresso, tudo num lugar só.</p>
   <a className="btn big" href="#entrar">Começar agora</a>
  </section>

  <div className="bento landing-grid">
   <section className="card">
    <h2 className="display"><span className="dim">Pratique na hora,</span> sem precisar de plano.</h2>
    <Spark/>
    <div className="mode-grid preview">{previewTiles.map(t=><div key={t.label} className={'mode-tile '+(t.big?'big':'')}><span className="mode-icon">{t.icon}</span><b>{t.label}</b></div>)}</div>
   </section>

   <section className="card">
    <h2 className="display">Treine agora <span className="dim">como se fosse a prova.</span></h2>
    <Spark/>
    <Segmented label="Tipo de simulado (demonstração)" value={kind} onChange={setKind} options={[{value:'oral',label:'Simulado oral'},{value:'escrito',label:'Simulado escrito'}]}/>
    <Orb state={kind==='oral'?'listening':'idle'} size={130}/>
    <p className="sim-question small">Por que a soma dos ângulos internos de um triângulo é 180°?</p>
    <p className="note">{kind==='oral'?'Responda em voz alta. Estou ouvindo.':'Escreva sua resposta e receba a correção.'}</p>
   </section>

   <section className="card">
    <h2 className="display"><span className="dim">Pergunte qualquer coisa,</span> a qualquer hora.</h2>
    <Spark/>
    <Orb state="speaking" size={110}/>
    <p className="orb-status">O tutor explica passo a passo</p>
    <div className="composer demo" aria-hidden="true">
     <span className="placeholder">Pergunte, fale ou tire uma foto</span>
     <div className="composer-tools"><span className="icon-btn"><Plus size={15}/></span><span className="icon-btn"><Camera size={15}/></span><span className="grow"/><span className="icon-btn"><Mic size={15}/></span><span className="send"><ArrowUp size={16}/></span></div>
    </div>
   </section>

   <section className="card">
    <h2 className="display"><span className="dim">Travou num exercício?</span> É só fotografar.</h2>
    <Spark/>
    <ScanIllustration/>
   </section>

   <section className="card">
    <h2 className="display">Um plano <span className="dim">que cabe no seu calendário.</span></h2>
    <Spark/>
    <div className="mini-weeks" aria-hidden="true">
     {[['Semana 1',['Potenciação e radiciação','Notação científica'],2],['Semana 2',['Porcentagens e juros','Expressões algébricas'],1],['Semana 3',['Sistemas de equações','Ângulos e polígonos'],0]].map(([w,items,done])=><div className="week" key={w as string}><h3>{w as string}</h3>{(items as string[]).map((t,i)=><div className={'topic '+(i<(done as number)?'done':'')} key={t}><span className="check">{i<(done as number)&&<Check size={12}/>}</span><span>{t}</span></div>)}</div>)}
    </div>
   </section>

   <section className="card">
    <h2 className="display">Veja <span className="dim">onde você está evoluindo.</span></h2>
    <Spark/>
    <div className="meters" aria-hidden="true">{[['Matemática',82],['Ciências',68],['Língua Portuguesa',74],['História',55]].map(([s,v])=><div className="meter" key={s}><div className="meter-label"><span>{s}</span><b>{v}%</b></div><div className="meter-track"><div style={{width:v+'%'}}/></div></div>)}</div>
    <p className="note">Exemplo ilustrativo. Seus números aparecem depois das primeiras respostas.</p>
   </section>
  </div>

  <AuthCard onLogin={onLogin}/>

  <p className="note center fine">Também dá para ouvir seus resumos <Headphones size={13}/> e revisar só o que você errou.</p>
 </div>;
}

function AuthCard({onLogin}:{onLogin:(u:User)=>void}){
 const [mode,setMode]=useState<'register'|'login'>('register');
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError('');
  const form=Object.fromEntries(new FormData(e.currentTarget).entries());
  try{
   const r=await fetch('/api/auth',{method:'POST',headers:json,body:JSON.stringify({op:mode,...form})});
   const x=await readJSON(r);if(!r.ok)throw Error(String(x.error||'Falha no login'));
   onLogin(x.user as User);
  }catch(err){setError(errorOf(err,'Falha no login'))}finally{setBusy(false)}
 }
 return <section className="card auth" id="entrar">
  <h2 className="display">{mode==='register'?<>Crie sua conta <span className="dim">e comece hoje.</span></>:<>Bem-vindo de volta. <span className="dim">Vamos continuar?</span></>}</h2>
  <Spark/>
  <Segmented label="Entrar ou criar conta" value={mode} onChange={m=>{setMode(m);setError('')}} options={[{value:'register',label:'Criar conta'},{value:'login',label:'Entrar'}]}/>
  <form className="form" onSubmit={submit}>
   {mode==='register'&&<input className="field" name="name" placeholder="Seu nome" aria-label="Nome" autoComplete="name" required maxLength={80}/>}
   <input className="field" name="email" type="email" placeholder="E-mail" aria-label="E-mail" autoComplete="email" required/>
   <input className="field" name="password" type="password" placeholder={mode==='register'?'Senha (8+ caracteres, letras e números)':'Senha'} aria-label="Senha" autoComplete={mode==='register'?'new-password':'current-password'} required minLength={mode==='register'?8:1}/>
   {error&&<p className="form-error" role="alert">{error}</p>}
   <button className="btn" disabled={busy}>{busy?'Aguarde…':mode==='login'?'Entrar':'Criar conta'}</button>
  </form>
  {mode==='register'&&<p className="note">Estudantes menores de idade devem criar a conta com um responsável. Guardamos apenas nome, e-mail e seus registros de estudo.</p>}
 </section>;
}
