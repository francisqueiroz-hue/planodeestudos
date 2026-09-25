'use client';
import {useEffect,useState} from 'react';
import {House,CalendarDays,ListChecks,MessageCircle,FileText,Timer,Square,X} from 'lucide-react';
import {curriculum} from '../../lib/curriculum';
import {useStudy} from './useStudy';
import {Overview} from './Overview';
import {PlanSection} from './PlanSection';
import {PracticeSection,type Mode} from './PracticeSection';
import {TutorSection} from './TutorSection';
import {MaterialsSection} from './MaterialsSection';

export type Section='inicio'|'plano'|'praticar'|'tutor'|'materiais';
export type Go=(section:Section,opts?:{topic?:string;mode?:Mode})=>void;
export type Clock={seconds:number;running:boolean;subject:string;setSubject:(s:string)=>void;start:()=>void;stop:()=>void};

const nav:{id:Section;label:string;icon:React.ReactNode}[]=[
 {id:'inicio',label:'Início',icon:<House size={16}/>},
 {id:'plano',label:'Plano',icon:<CalendarDays size={16}/>},
 {id:'praticar',label:'Praticar',icon:<ListChecks size={16}/>},
 {id:'tutor',label:'Tutor',icon:<MessageCircle size={16}/>},
 {id:'materiais',label:'Materiais',icon:<FileText size={16}/>},
];

export function Dashboard({name,onExpired}:{name:string;onExpired:()=>void}){
 const study=useStudy(onExpired);
 const {error,message,setError,setMessage,loaded,post}=study;
 const [section,setSection]=useState<Section>('inicio');
 const [practice,setPractice]=useState<{topic?:string;mode?:Mode;n:number}>({n:0});

 // Cronômetro fica aqui para continuar contando ao trocar de seção.
 const [seconds,setSeconds]=useState(0),[running,setRunning]=useState(false),[subject,setSubject]=useState(Object.keys(curriculum)[0]);
 useEffect(()=>{if(!running)return;const id=setInterval(()=>setSeconds(v=>v+1),1000);return()=>clearInterval(id)},[running]);
 async function stop(){
  setRunning(false);
  if(seconds>=60){const x=await post('/api/ai',{op:'session',seconds:Math.min(seconds,4*3600),subject});if(x)setMessage(`Sessão de ${Math.round(seconds/60)} min registrada.`)}
  else setMessage('Sessões com menos de 1 minuto não são registradas.');
  setSeconds(0);
 }
 const clock:Clock={seconds,running,subject,setSubject,start:()=>setRunning(true),stop};

 useEffect(()=>{if(!message)return;const id=setTimeout(()=>setMessage(''),6000);return()=>clearTimeout(id)},[message,setMessage]);

 const go:Go=(s,opts)=>{setError('');setMessage('');if(s==='praticar')setPractice(p=>({...opts,n:p.n+1}));setSection(s);window.scrollTo({top:0,behavior:'smooth'})};
 const mmss=`${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;

 return <>
  <nav className="pill-nav" aria-label="Seções do painel">{nav.map(n=><button key={n.id} className={section===n.id?'on':''} aria-current={section===n.id?'page':undefined} onClick={()=>go(n.id)}>{n.icon}<span>{n.label}</span></button>)}</nav>

  <div className="toasts" aria-live="polite">
   {error&&<div className="toast error" role="alert">{error}<button aria-label="Fechar" onClick={()=>setError('')}><X size={14}/></button></div>}
   {message&&<div className="toast ok" role="status">{message}<button aria-label="Fechar" onClick={()=>setMessage('')}><X size={14}/></button></div>}
  </div>

  {running&&section!=='inicio'&&<button className="timer-pill" onClick={stop} aria-label={`Encerrar sessão de ${subject}`}><Timer size={14}/> {subject} · {mmss} <Square size={12}/></button>}

  {!loaded&&<p className="note center" role="status">Carregando seus dados…</p>}
  <div className="section-body" aria-busy={study.busy}>
   {section==='inicio'&&<Overview study={study} name={name} go={go} clock={clock}/>}
   {section==='plano'&&<PlanSection study={study} go={go}/>}
   {section==='praticar'&&<PracticeSection key={practice.n} study={study} go={go} initialTopic={practice.topic} initialMode={practice.mode}/>}
   {section==='tutor'&&<TutorSection study={study}/>}
   {section==='materiais'&&<MaterialsSection study={study}/>}
  </div>
 </>;
}
