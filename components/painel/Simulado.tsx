'use client';
import {useEffect,useState} from 'react';
import {Mic,Square,Volume2,ChevronRight,RotateCcw} from 'lucide-react';
import {LETTERS,Orb,Segmented,Spark,Verdict,matchSpokenOption,optionsOf,shuffle,useVoice,type OrbState,type Question,type Result} from './shared';
import type {Study} from './useStudy';

type Kind='oral'|'escrito';
type Answer={q:Question;reply:string;result:Result};

export function Simulado({study,pool}:{study:Study;pool:Question[]}){
 const {grade,busy,setError}=study;
 const voice=useVoice(setError);
 const [kind,setKind]=useState<Kind>('oral'),[size,setSize]=useState(5);
 const [items,setItems]=useState<Question[]>([]),[index,setIndex]=useState(0),[reply,setReply]=useState(''),[choice,setChoice]=useState<number|null>(null);
 const [current,setCurrent]=useState<Result|null>(null),[answers,setAnswers]=useState<Answer[]>([]);
 const [seconds,setSeconds]=useState(0),[running,setRunning]=useState(false);
 useEffect(()=>{if(!running)return;const id=setInterval(()=>setSeconds(s=>s+1),1000);return()=>clearInterval(id)},[running]);

 const q=items[index];
 const finished=items.length>0&&!q;
 const oral=kind==='oral'&&voice.supported;

 const opts=q?optionsOf(q):null;
 // No oral, as alternativas também são lidas; a resposta falada vira letra ou texto.
 function spoken(question:Question){const o=optionsOf(question);return o?`${question.prompt} ${o.map((x,i)=>`Alternativa ${LETTERS[i]}: ${x}.`).join(' ')}`:question.prompt}
 function hear(question:Question){voice.listen(t=>{const o=optionsOf(question);if(!o){setReply(v=>(v?v+' ':'')+t);return}const i=matchSpokenOption(t,o);if(i===null)setError(`Não entendi “${t}”. Diga, por exemplo, “letra B”.`);else{setError('');setChoice(i)}})}
 function ask(question:Question){if(oral)voice.speak(spoken(question),()=>hear(question))}
 function start(){
  const chosen=shuffle(pool).slice(0,size);if(!chosen.length)return;
  setItems(chosen);setIndex(0);setAnswers([]);setReply('');setChoice(null);setCurrent(null);setSeconds(0);setRunning(true);
  ask(chosen[0]);
 }
 async function confirm(){
  voice.stop();voice.silence();
  const response=opts?(choice===null?'':opts[choice]):reply;
  const r=await grade(q,response);if(!r)return;
  setCurrent(r);setAnswers(a=>[...a,{q,reply:opts&&choice!==null?`${LETTERS[choice]}) ${response}`:response,result:r}]);
  if(oral)voice.speak(r.verdict==='correct'?'Correto!':`A resposta certa era: ${q.answer}`);
 }
 function next(){
  voice.silence();setCurrent(null);setReply('');setChoice(null);
  const n=index+1;setIndex(n);
  if(n>=items.length){setRunning(false);return}
  ask(items[n]);
 }
 function reset(){voice.stop();voice.silence();setItems([]);setAnswers([]);setRunning(false)}

 const state:OrbState=voice.listening?'listening':voice.speaking?'speaking':busy?'thinking':'idle';
 const clock=`${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;

 if(!items.length)return <section className="card wide simulado">
  <Spark/>
  <Segmented label="Tipo de simulado" value={kind} onChange={setKind} options={[{value:'oral',label:'Simulado oral'},{value:'escrito',label:'Simulado escrito'}]}/>
  <Orb state="idle" size={140}/>
  <p className="lead">{kind==='oral'?'Eu leio cada pergunta em voz alta e você responde falando, como numa arguição.':'Uma pergunta por vez, sem consulta, com correção ao final de cada resposta.'}</p>
  {kind==='oral'&&!voice.supported&&<p className="pending">Este navegador não reconhece fala. O simulado vai funcionar no modo escrito.</p>}
  <div className="row center">
   <label className="field-label">Número de questões<select className="field" value={size} onChange={e=>setSize(Number(e.target.value))}>{[5,10,15].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
  </div>
  <button className="btn" onClick={start} disabled={!pool.length}>Começar simulado</button>
  {!pool.length&&<p className="note">Nenhuma questão para este filtro.</p>}
 </section>;

 if(finished){
  const ok=answers.filter(a=>a.result.verdict==='correct').length;
  const score=Math.round(ok*100/answers.length);
  return <section className="card wide simulado">
   <Spark/>
   <h2 className="display">Você acertou {ok} de {answers.length}. <span className="dim">{score>=70?'Mandou bem!':score>=50?'Está no caminho.':'Bora revisar?'}</span></h2>
   <div className="ring big" style={{['--p' as string]:ok/answers.length}}><span>{score}%</span></div>
   <p className="note">Tempo total: {clock}</p>
   <ol className="results">{answers.map(a=><li key={a.q.id} className={a.result.verdict}><b>{a.q.prompt}</b><span>Sua resposta: {a.reply||'—'}</span><span>Gabarito: {a.q.answer}</span></li>)}</ol>
   <button className="btn" onClick={reset}><RotateCcw size={15}/> Novo simulado</button>
  </section>;
 }

 return <section className="card wide simulado">
  <div className="sim-top"><span className="eyebrow">Questão {index+1} de {items.length}</span><span className="eyebrow">{clock}</span></div>
  <div className="progress-line"><div style={{width:`${(index/items.length)*100}%`}}/></div>
  {oral&&<Orb state={state} size={140} label={state==='listening'?'Ouvindo':state==='speaking'?'Lendo a pergunta':state==='thinking'?'Corrigindo':'Aguardando'}/>}
  <p className="sim-question">{q.prompt}</p>
  {oral&&<p className="note">{voice.listening?(opts?'Estou ouvindo. Diga a letra da alternativa.':'Estou ouvindo. Responda em voz alta.'):voice.speaking?'Lendo…':'Toque no microfone para responder.'}</p>}
  {opts&&<div className="options narrow" role="radiogroup" aria-label="Alternativas">{opts.map((o,i)=>{const right=current&&o===q.answer,wrong=current&&i===choice&&o!==q.answer;return <button key={i} type="button" role="radio" aria-checked={choice===i} disabled={Boolean(current)} className={'option '+(choice===i?'on ':'')+(right?'right ':'')+(wrong?'wrong':'')} onClick={()=>setChoice(i)}><span className="letter">{LETTERS[i]}</span><span>{o}</span></button>})}</div>}
  {!current&&<form className="form narrow" onSubmit={e=>{e.preventDefault();confirm()}}>
   {oral&&<div className="row center">
     <button type="button" className="icon-btn" aria-label="Ouvir a pergunta de novo" onClick={()=>voice.speak(spoken(q))}><Volume2 size={16}/></button>
     <button type="button" className={'icon-btn '+(voice.listening?'rec':'')} aria-label={voice.listening?'Parar':'Responder falando'} onClick={()=>voice.listening?voice.stop():hear(q)}>{voice.listening?<Square size={16}/>:<Mic size={16}/>}</button></div>}
   {!opts&&(oral
    ?<input className="field" value={reply} onChange={e=>setReply(e.target.value)} placeholder="Sua resposta falada aparece aqui" aria-label="Sua resposta"/>
    :<textarea className="field" rows={3} value={reply} onChange={e=>setReply(e.target.value)} placeholder="Escreva sua resposta" aria-label="Sua resposta" autoFocus/>)}
   <div className="row center"><button type="button" className="btn ghost" onClick={reset}>Encerrar</button><button className="btn" disabled={busy||(opts?choice===null:!reply.trim())}>{busy?'Corrigindo…':'Confirmar resposta'}</button></div>
  </form>}
  {current&&<div className="feedback narrow"><Verdict result={current}/><p><b>Gabarito:</b> {opts?`${LETTERS[opts.indexOf(q.answer)]??''}) `:''}{q.answer}</p>{q.explanation&&<p className="note">{q.explanation}</p>}<button className="btn" onClick={next} autoFocus>{index+1<items.length?<>Próxima <ChevronRight size={15}/></>:'Ver resultado'}</button></div>}
 </section>;
}
