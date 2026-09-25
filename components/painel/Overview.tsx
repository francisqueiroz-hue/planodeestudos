'use client';
import {Flame,Target,Timer,CircleCheck,ChevronRight,Play,Square} from 'lucide-react';
import {curriculum} from '../../lib/curriculum';
import {Spark,lastAttempts} from './shared';
import type {Study} from './useStudy';
import type {Clock,Go} from './Dashboard';

const subjects=Object.keys(curriculum);
const dayKey=(t:number|Date)=>new Date(t).toDateString();

export function Overview({study,name,go,clock:c}:{study:Study;name:string;go:Go;clock:Clock}){
 const {data,sessions}=study;
 const timer=c.seconds;

 const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-6+i);return d});
 const daily=days.map(d=>sessions.filter(s=>dayKey(s.createdAt)===d.toDateString()).reduce((n,s)=>n+s.durationSeconds,0));
 const maxDaily=Math.max(...daily,1),weekMinutes=Math.round(daily.reduce((a,b)=>a+b,0)/60);

 // Dias seguidos com estudo registrado (sessão ou resposta), contando de hoje ou ontem para trás.
 const active=new Set([...sessions.map(s=>dayKey(s.createdAt)),...data.attempts.map(a=>dayKey(a.createdAt))]);
 let streak=0;const cursor=new Date();if(!active.has(cursor.toDateString()))cursor.setDate(cursor.getDate()-1);
 while(active.has(cursor.toDateString())){streak++;cursor.setDate(cursor.getDate()-1)}

 const correct=data.attempts.filter(a=>a.correct).length;
 const last=lastAttempts(data.attempts);
 const toReview=data.questions.filter(q=>{const a=last.get(q.id);return a&&!a.correct}).length;
 const done=data.topics.filter(t=>t.status==='done').length;
 const next=data.plans.flatMap(p=>data.topics.filter(t=>t.planId===p.id&&t.status!=='done').slice(0,2).map(t=>({t,plan:p.title}))).slice(0,4);

 const bySubject=subjects.map(s=>{const qs=new Set(data.questions.filter(q=>q.subject===s).map(q=>q.id));const tries=data.attempts.filter(a=>qs.has(a.questionId));return {s,total:tries.length,ok:tries.filter(a=>a.correct).length}}).filter(x=>x.total>0);

 const clock=`${Math.floor(timer/60).toString().padStart(2,'0')}:${(timer%60).toString().padStart(2,'0')}`;

 return <div className="stack">
  <header className="page-head">
   <h1 className="display xl"><span className="dim">Olá, {name.split(' ')[0]}.</span> O que vamos estudar hoje?</h1>
  </header>

  <div className="stats">
   <div className="stat"><Timer size={18}/><b>{weekMinutes} min</b><span>nos últimos 7 dias</span></div>
   <div className="stat"><Flame size={18}/><b>{streak} {streak===1?'dia':'dias'}</b><span>de sequência</span></div>
   <div className="stat"><Target size={18}/><b>{data.attempts.length?Math.round(correct*100/data.attempts.length)+'%':'—'}</b><span>{correct} de {data.attempts.length} {data.attempts.length===1?'acerto':'acertos'}</span></div>
   <div className="stat"><CircleCheck size={18}/><b>{done}/{data.topics.length}</b><span>temas concluídos</span></div>
  </div>

  <div className="bento">
   <section className="card">
    <h2 className="display"><span className="dim">Foco agora:</span> cronometre sua sessão.</h2>
    <Spark/>
    <div className="timer-face" aria-live="off">{clock}</div>
    <div className="row center">
     <select className="field" aria-label="Disciplina da sessão" value={c.subject} onChange={e=>c.setSubject(e.target.value)} disabled={c.running}>{subjects.map(x=><option key={x}>{x}</option>)}</select>
     <button className="btn" onClick={()=>c.running?c.stop():c.start()}>{c.running?<><Square size={15}/> Encerrar</>:<><Play size={15}/> Começar</>}</button>
    </div>
    <p className="note">Sessões a partir de 1 minuto entram no seu histórico.</p>
   </section>

   <section className="card">
    <h2 className="display">Seu ritmo <span className="dim">na semana.</span></h2>
    <Spark/>
    <div className="bars" role="img" aria-label={'Minutos por dia: '+daily.map((v,i)=>days[i].toLocaleDateString('pt-BR',{weekday:'short'})+' '+Math.round(v/60)).join(', ')}>
     {daily.map((v,i)=><div className="bar" key={i}><small>{Math.round(v/60)}</small><div style={{height:Math.max(3,Math.round(v/maxDaily*120))+'px'}} className={i===6?'today':''}/><span>{days[i].toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','')}</span></div>)}
    </div>
    {weekMinutes===0&&<p className="note">Use o cronômetro ao lado para registrar seu tempo de estudo.</p>}
   </section>

   <section className="card">
    <h2 className="display"><span className="dim">Próximos passos</span> do seu plano.</h2>
    <Spark/>
    {next.length===0
     ?<div className="empty"><p>Você ainda não tem temas pendentes.</p><button className="btn" onClick={()=>go('plano')}>Montar meu plano</button></div>
     :<ul className="list">{next.map(({t,plan})=><li key={t.id}><div><b>{t.title}</b><small>{plan} · semana {t.week}</small></div><button className="icon-btn" aria-label={`Praticar ${t.title}`} onClick={()=>go('praticar',{topic:t.title})}><ChevronRight size={18}/></button></li>)}</ul>}
   </section>

   <section className="card">
    <h2 className="display">Onde você <span className="dim">está indo bem.</span></h2>
    <Spark/>
    {bySubject.length===0
     ?<div className="empty"><p>Responda algumas questões para ver seu desempenho por disciplina.</p><button className="btn" onClick={()=>go('praticar')}>Praticar agora</button></div>
     :<div className="meters">{bySubject.map(x=><div key={x.s} className="meter"><div className="meter-label"><span>{x.s}</span><b>{Math.round(x.ok*100/x.total)}%</b></div><div className="meter-track"><div style={{width:Math.round(x.ok*100/x.total)+'%'}}/></div><small>{x.ok} de {x.total} {x.total===1?'resposta':'respostas'}</small></div>)}</div>}
    {toReview>0&&<button className="btn secondary" onClick={()=>go('praticar',{mode:'revisao'})}>Revisar {toReview} {toReview===1?'questão':'questões'} que errei</button>}
   </section>
  </div>
 </div>;
}
