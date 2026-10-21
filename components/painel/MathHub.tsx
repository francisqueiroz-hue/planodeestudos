'use client';
import {useState} from 'react';
import {Zap,GraduationCap,Repeat,Play,ChevronRight,RotateCcw,Trophy} from 'lucide-react';
import {curriculum} from '../../lib/curriculum';
import {bimester,schoolWeek,topicPlans} from '../../lib/study-plan.ts';
import {drillTopics,makeDrill,type Drill} from '../../lib/math-drill.ts';
import {LETTERS,Spark,lastAttempts,topicFor,videosFor} from './shared';
import type {Study} from './useStudy';
import type {Go} from './Dashboard';

const SUBJECT='Matemática';
const topics=curriculum[SUBJECT];

export function MathHub({study,go}:{study:Study;go:Go}){
 const {data}=study;
 const [drillTopic,setDrillTopic]=useState<string|null>(null);
 const mathQ=data.questions.filter(q=>q.subject===SUBJECT);
 const ids=new Set(mathQ.map(q=>q.id));
 const tries=data.attempts.filter(a=>ids.has(a.questionId));
 const last=lastAttempts(tries);
 const correct=tries.filter(a=>a.correct).length;
 const wrong=mathQ.filter(q=>{const a=last.get(q.id);return a&&!a.correct}).length;

 const stats=topics.map((t,i)=>{
  const qs=mathQ.filter(q=>topicFor(q)===t),qids=new Set(qs.map(q=>q.id));
  const tt=tries.filter(a=>qids.has(a.questionId)),done=new Set(tt.map(a=>a.questionId)).size;
  const acc=tt.length?Math.round(tt.filter(a=>a.correct).length*100/tt.length):null;
  return {t,i,total:qs.length,done,acc,week:schoolWeek(i,topics.length),video:videosFor(data.resources,SUBJECT,t)[0]};
 });
 const mastered=stats.filter(s=>s.acc!==null&&s.acc>=80&&s.done>=5).length;

 return <div className="stack">
  <header className="page-head"><h1 className="display xl"><span className="dim">Matemática</span> em foco, tema por tema.</h1></header>

  <div className="stats">
   <div className="stat"><b>{mathQ.length}</b><span>questões de Matemática no seu banco</span></div>
   <div className="stat"><b>{tries.length}</b><span>respostas registradas</span></div>
   <div className="stat"><b>{tries.length?Math.round(correct*100/tries.length)+'%':'—'}</b><span>de acertos</span></div>
   <div className="stat"><b>{mastered}/{topics.length}</b><span>temas dominados (80%+)</span></div>
  </div>

  {drillTopic!==null&&<DrillPanel key={drillTopic} topic={drillTopic} onClose={()=>setDrillTopic(null)}/>}

  <section className="card wide">
   <h2 className="display"><span className="dim">Escolha como treinar</span> hoje.</h2>
   <Spark/>
   <div className="mode-grid">
    <button className="mode-tile big" onClick={()=>setDrillTopic('')}><span className="mode-icon"><Zap size={20}/></span><b>Treino rápido</b><small>10 contas novas a cada rodada</small></button>
    <button className="mode-tile big" onClick={()=>go('praticar',{mode:'simulado',subject:SUBJECT})}><span className="mode-icon"><GraduationCap size={20}/></span><b>Simulado</b><small>Questões do banco, com nota</small></button>
    <button className="mode-tile big" onClick={()=>go('praticar',{mode:'revisao',subject:SUBJECT})}><span className="mode-icon"><Repeat size={20}/></span><b>Revisar erros</b><small>{wrong?`${wrong} para revisar`:'Nada pendente'}</small></button>
   </div>
  </section>

  <div className="topic-grid">{stats.map(s=>{const plan=topicPlans[SUBJECT]?.[s.t];return <article className="card topic-card" key={s.t}>
   <small className="eyebrow">Semana {s.week} · {bimester(s.week)}º bimestre</small>
   <h3>{s.t}</h3>
   {plan&&<p className="note">{plan.objective}</p>}
   <div className="meter-track" aria-label={`${s.done} de ${s.total} questões respondidas`}><div style={{width:(s.total?Math.round(s.done*100/s.total):0)+'%'}}/></div>
   <small className="note">{s.done}/{s.total} questões feitas{s.acc!==null?` · ${s.acc}% de acertos`:''}</small>
   <div className="row">
    <button className="btn sm" onClick={()=>go('praticar',{topic:s.t,mode:'quiz'})}>Questões <ChevronRight size={14}/></button>
    {drillTopics.includes(s.t)&&<button className="btn sm secondary" onClick={()=>{setDrillTopic(s.t);window.scrollTo({top:0,behavior:'smooth'})}}><Zap size={14}/> Treino</button>}
    {s.video&&<a className="link" href={s.video.url} target="_blank" rel="noopener noreferrer" title={s.video.title}><Play size={13}/> Aula</a>}
   </div>
  </article>})}</div>
 </div>;
}

// Treino rápido: 10 exercícios gerados na hora, corrigidos no próprio navegador.
function DrillPanel({topic,onClose}:{topic:string;onClose:()=>void}){
 const [seed,setSeed]=useState(()=>Date.now());
 const [items,setItems]=useState<Drill[]>(()=>makeDrill(10,topic,seed));
 const [i,setI]=useState(0),[choice,setChoice]=useState<number|null>(null),[checked,setChecked]=useState(false),[score,setScore]=useState(0);
 const d=items[i],finished=i>=items.length;
 function restart(){const s=seed+1;setSeed(s);setItems(makeDrill(10,topic,s));setI(0);setChoice(null);setChecked(false);setScore(0)}
 function check(){if(choice===null)return;setChecked(true);if(d.options[choice]===d.answer)setScore(v=>v+1)}
 function next(){setI(v=>v+1);setChoice(null);setChecked(false)}
 return <section className="card wide simulado drill" aria-live="polite">
  <div className="sim-top"><span className="eyebrow">Treino rápido · {topic||'todos os temas'}</span><button className="link" onClick={onClose}>Fechar</button></div>
  {finished
   ?<><Trophy size={36}/><h2 className="display">Você acertou {score} de {items.length}. <span className="dim">{score>=8?'Excelente!':score>=6?'Bom treino!':'Vale mais uma rodada.'}</span></h2>
     <div className="row center"><button className="btn" onClick={restart}><RotateCcw size={15}/> Nova rodada</button><button className="btn ghost" onClick={onClose}>Voltar aos temas</button></div></>
   :<>
     <div className="sim-top"><span className="eyebrow">{i+1} de {items.length}</span><span className="eyebrow">{score} acertos</span></div>
     <div className="progress-line"><div style={{width:`${(i/items.length)*100}%`}}/></div>
     {!topic&&<small className="eyebrow">{d.topic}</small>}
     <p className="sim-question">{d.prompt}</p>
     <div className="options narrow" role="radiogroup" aria-label="Alternativas">{d.options.map((o,k)=>{const right=checked&&o===d.answer,wrong=checked&&k===choice&&o!==d.answer;return <button key={k} type="button" role="radio" aria-checked={choice===k} disabled={checked} className={'option '+(choice===k?'on ':'')+(right?'right ':'')+(wrong?'wrong':'')} onClick={()=>setChoice(k)}><span className="letter">{LETTERS[k]}</span><span>{o}</span></button>})}</div>
     {!checked
      ?<button className="btn" disabled={choice===null} onClick={check}>Conferir</button>
      :<div className="feedback narrow"><p className={'verdict '+(d.options[choice!]===d.answer?'correct':'incorrect')}><b>{d.options[choice!]===d.answer?'Correta.':'Incorreta.'}</b> Resposta: {d.answer}</p><p className="note">{d.explanation}</p><button className="btn" onClick={next} autoFocus>{i+1<items.length?'Próxima':'Ver resultado'} <ChevronRight size={15}/></button></div>}
    </>}
 </section>;
}
