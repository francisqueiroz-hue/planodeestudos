'use client';
import {useRef,useState} from 'react';
import {CalendarDays,ChevronRight,Play,Trash2,Wand} from 'lucide-react';
import {curriculum} from '../../lib/curriculum';
import {Spark,type Topic} from './shared';
import type {Study} from './useStudy';
import type {Go} from './Dashboard';

const subjects=Object.keys(curriculum);

export function PlanSection({study,go}:{study:Study;go:Go}){
 const {data,setData,post,busy,setMessage,loaded}=study;
 const [subject,setSubject]=useState(subjects[0]);
 const topicsField=useRef<HTMLTextAreaElement|null>(null);

 async function toggle(t:Topic){
  const status=t.status==='done'?'pending':'done';
  const set=(v:string)=>setData(d=>({...d,topics:d.topics.map(x=>x.id===t.id?{...x,status:v}:x)}));
  set(status);
  if(!await post('/api/study',{op:'topic',id:t.id,status},{reload:false}))set(t.status);
 }
 async function createPlan(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();const f=e.currentTarget;
  const x=await post('/api/study',{op:'plan',...Object.fromEntries(new FormData(f).entries())});
  if(x){f.reset();setMessage('Plano criado.')}
 }

 return <div className="stack">
  <header className="page-head"><h1 className="display xl">Um plano <span className="dim">que cabe no seu calendário.</span></h1></header>

  <div className="bento">
   <section className="card">
    <h2 className="display"><span className="dim">Comece rápido</span> com uma trilha guiada.</h2>
    <Spark/>
    <p className="note">Temas do 8º ano em sequência, dois por semana, com aulas e questões para cada um.</p>
    <div className="chips" role="radiogroup" aria-label="Disciplina da trilha">{subjects.map(s=><button key={s} role="radio" aria-checked={subject===s} className={'chip '+(subject===s?'on':'')} onClick={()=>setSubject(s)}>{s}</button>)}</div>
    <button className="btn" disabled={busy} onClick={async()=>{const x=await post('/api/study',{op:'path',subject});if(x)setMessage(String(x.notice||`Trilha de ${subject} criada com ${x.count} temas.`))}}><Wand size={16}/> Criar trilha de {subject}</button>
   </section>

   <section className="card">
    <h2 className="display">Tem prova marcada? <span className="dim">Monte o seu.</span></h2>
    <Spark/>
    <form className="form" onSubmit={createPlan}>
     <input className="field" name="title" placeholder="Nome da prova (ex.: Prova do 3º bimestre)" aria-label="Nome da prova" required maxLength={160}/>
     <div className="row">
      <label className="field-label">Data da prova<input className="field" name="examDate" type="date"/></label>
      <label className="field-label">Meta (opcional)<input className="field" name="target" placeholder="ex.: nota 8" maxLength={80}/></label>
     </div>
     <textarea ref={topicsField} className="field" name="subjects" rows={4} placeholder="Um tema por linha" aria-label="Temas, um por linha" required/>
     <div className="row">
      <button type="button" className="btn ghost" onClick={()=>{if(topicsField.current)topicsField.current.value=curriculum[subject].join('\n')}}>Usar temas de {subject}</button>
      <button className="btn" disabled={busy}>Criar plano</button>
     </div>
     <p className="note">Com a data, os temas são distribuídos pelas semanas até a prova.</p>
    </form>
   </section>
  </div>

  {loaded&&data.plans.length===0&&<p className="note center">Nenhum plano ainda. Crie uma trilha ou monte o seu acima.</p>}
  {data.plans.map(p=>{
   const list=data.topics.filter(t=>t.planId===p.id);const done=list.filter(t=>t.status==='done').length;
   const weeks=[...new Set(list.map(t=>t.week||1))].sort((a,b)=>a-b);
   return <section className="card wide plan" key={p.id}>
    <div className="plan-head">
     <div><h2 className="display sm">{p.title}</h2>
      <p className="note"><CalendarDays size={14}/> {p.examDate?'Prova em '+p.examDate.split('-').reverse().join('/'):'Sem data definida'}{p.target?` · Meta: ${p.target}`:''}</p></div>
     <div className="ring" style={{['--p' as string]:list.length?done/list.length:0}} aria-label={`${done} de ${list.length} temas concluídos`}><span>{done}/{list.length}</span></div>
    </div>
    <div className="weeks">{weeks.map(w=><div className="week" key={w}>
     <h3>Semana {w}</h3>
     {list.filter(t=>(t.week||1)===w).map(t=>{const vids=data.resources.filter(r=>r.topic===t.title&&r.kind!=='repository').slice(0,2);return <div className={'topic '+(t.status==='done'?'done':'')} key={t.id}>
      <label><input type="checkbox" checked={t.status==='done'} onChange={()=>toggle(t)}/><span>{t.title}</span></label>
      <div className="topic-actions">
       {vids.map((r,i)=><a key={r.id} className="link" href={r.url} target="_blank" rel="noopener noreferrer" title={`${r.title} · ${r.provider}`}><Play size={13}/> Aula{vids.length>1?` ${i+1}`:''}</a>)}
       <button className="link" onClick={()=>go('praticar',{topic:t.title})}>Praticar <ChevronRight size={13}/></button>
      </div>
     </div>})}
    </div>)}</div>
    <button className="danger" onClick={async()=>{if(confirm(`Excluir o plano “${p.title}”?`))await post('/api/study',{op:'delete',table:'plan',id:p.id})}}><Trash2 size={14}/> Excluir plano</button>
   </section>;
  })}
 </div>;
}
