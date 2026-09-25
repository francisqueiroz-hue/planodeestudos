'use client';
import {useEffect,useState} from 'react';
import {ArrowLeft,Layers,Mic,Pencil,MessageCircle,Repeat,Headphones,ListChecks,GraduationCap,Play,Trash2,RotateCcw,ChevronRight,Shuffle,Square} from 'lucide-react';
import {curriculum} from '../../lib/curriculum';
import {LETTERS,LEVELS,Spark,Verdict,lastAttempts,matchSpokenOption,optionsOf,topicFor,shuffle,useVoice,videosFor,type Question,type Result} from './shared';
import {Simulado} from './Simulado';
import type {Study} from './useStudy';
import type {Go} from './Dashboard';

const subjects=Object.keys(curriculum);
export type Mode='quiz'|'flashcards'|'revisao'|'simulado'|'exercicios';

const tiles:{id:Mode|'tutor'|'ouvir';label:string;icon:React.ReactNode;hint:string;big?:boolean}[]=[
 {id:'flashcards',label:'Flashcards',icon:<Layers size={18}/>,hint:'Vire o cartão e confira'},
 {id:'simulado',label:'Simulado',icon:<GraduationCap size={20}/>,hint:'Oral ou escrito, com nota',big:true},
 {id:'exercicios',label:'Exercícios',icon:<Pencil size={18}/>,hint:'Gere questões com IA'},
 {id:'tutor',label:'Chat',icon:<MessageCircle size={18}/>,hint:'Tire dúvidas com o tutor'},
 {id:'quiz',label:'Quiz',icon:<ListChecks size={20}/>,hint:'Responda e corrija na hora',big:true},
 {id:'revisao',label:'Revisão',icon:<Repeat size={18}/>,hint:'Refaça o que você errou'},
 {id:'ouvir',label:'Ouvir',icon:<Headphones size={18}/>,hint:'Escute seus resumos'},
];

export function PracticeSection({study,go,initialTopic,initialMode}:{study:Study;go:Go;initialTopic?:string;initialMode?:Mode}){
 const {data}=study;
 const [mode,setMode]=useState<Mode|null>(initialMode??(initialTopic?'quiz':null));
 const [subject,setSubject]=useState(''),[topic,setTopic]=useState(initialTopic||''),[level,setLevel]=useState(0);
 const last=lastAttempts(data.attempts);
 const filtered=data.questions.filter(q=>(!subject||q.subject===subject)&&(!topic||topicFor(q)===topic)&&(!level||q.difficulty===level));
 const wrong=data.questions.filter(q=>{const a=last.get(q.id);return a&&!a.correct});

 if(!mode)return <div className="stack">
  <header className="page-head"><h1 className="display xl"><span className="dim">Pratique</span> do jeito que funciona pra você.</h1></header>
  <section className="card wide">
   <Spark/>
   <div className="mode-grid">{tiles.map(t=><button key={t.id} className={'mode-tile '+(t.big?'big':'')} onClick={()=>t.id==='tutor'?go('tutor'):t.id==='ouvir'?go('materiais'):setMode(t.id)}>
    <span className="mode-icon">{t.icon}</span><b>{t.label}</b><small>{t.id==='revisao'&&wrong.length?`${wrong.length} para revisar`:t.hint}</small>
   </button>)}</div>
   <p className="note center">{data.questions.length} questões no seu banco · {data.attempts.length} respostas registradas</p>
  </section>
  <section className="card wide repos">
   <h2 className="display"><span className="dim">Quer ir além?</span> Provas e bancos oficiais.</h2>
   <Spark/>
   <div className="repo-grid">{data.resources.filter(r=>r.kind==='repository').map(r=><a key={r.id} className="repo" href={r.url} target="_blank" rel="noopener noreferrer"><small className="eyebrow">{r.subject}</small><b>{r.title}</b><span className="note">{r.provider} ↗</span></a>)}</div>
   <p className="note">As questões desses acervos ficam nos sites de origem, com os direitos de seus autores.</p>
  </section>
 </div>;

 const title:Record<Mode,React.ReactNode>={
  quiz:<>Quiz: <span className="dim">responda e confira.</span></>,
  flashcards:<><span className="dim">Flashcards:</span> puxe da memória.</>,
  revisao:<><span className="dim">Revisão:</span> errar faz parte, repetir fixa.</>,
  simulado:<>Treine agora <span className="dim">como se fosse a prova.</span></>,
  exercicios:<>Exercícios novos <span className="dim">sobre qualquer tema.</span></>,
 };

 return <div className="stack">
  <header className="page-head">
   <button className="back" onClick={()=>setMode(null)}><ArrowLeft size={16}/> Modos de estudo</button>
   <h1 className="display lg">{title[mode]}</h1>
  </header>
  {(mode==='quiz'||mode==='flashcards'||mode==='simulado')&&<div className="row filters">
   <select className="field" aria-label="Disciplina" value={subject} onChange={e=>{setSubject(e.target.value);setTopic('')}}><option value="">Todas as disciplinas</option>{subjects.map(s=><option key={s}>{s}</option>)}</select>
   <select className="field" aria-label="Nível" value={level} onChange={e=>setLevel(Number(e.target.value))}><option value={0}>Todos os níveis</option>{[1,2,3].map(n=><option key={n} value={n}>{LEVELS[n]}</option>)}</select>
   {topic&&<span className="chip on">{topic} <button aria-label="Remover filtro de tema" onClick={()=>setTopic('')}>×</button></span>}
   <span className="note">{filtered.length} questões</span>
  </div>}
  {mode==='quiz'&&<QuestionList study={study} questions={filtered} empty="Nenhuma questão para este filtro. Gere exercícios com IA ou mude o filtro."/>}
  {mode==='revisao'&&<QuestionList study={study} questions={wrong} empty="Nada para revisar. Quando errar uma questão, ela aparece aqui até você acertar."/>}
  {mode==='flashcards'&&<Flashcards key={subject+topic+level} questions={filtered}/>}
  {mode==='simulado'&&<Simulado key={subject+topic+level} study={study} pool={filtered}/>}
  {mode==='exercicios'&&<Exercises study={study} onCreated={()=>{setSubject('');setTopic('');setMode('quiz')}}/>}
 </div>;
}

function QuestionList({study,questions,empty}:{study:Study;questions:Question[];empty:string}){
 const [limit,setLimit]=useState(10);
 if(!questions.length)return <p className="note center card">{empty}</p>;
 return <div className="stack">
  {questions.slice(0,limit).map(q=><QuestionCard key={q.id} study={study} q={q}/>)}
  {questions.length>limit&&<button className="btn secondary center-self" onClick={()=>setLimit(l=>l+10)}>Mostrar mais ({questions.length-limit})</button>}
 </div>;
}

function QuestionCard({study,q}:{study:Study;q:Question}){
 const {busy,grade,post,data,setError}=study;
 const [reply,setReply]=useState(''),[choice,setChoice]=useState<number|null>(null),[result,setResult]=useState<Result|null>(null);
 const voice=useVoice(setError);
 const options=optionsOf(q);
 const videos=videosFor(data.resources,q.subject,topicFor(q)).slice(0,2);
 async function check(e?:React.FormEvent){e?.preventDefault();const r=await grade(q,options?(choice===null?'':options[choice]):reply);if(r)setResult(r)}
 const answered=Boolean(result);
 return <article className="card q-card">
  <small className="eyebrow">{q.subject||'Questão própria'} · {q.topicLabel||'Tema livre'}{q.difficulty?` · ${LEVELS[q.difficulty]}`:''}</small>
  <p className="q-prompt">{q.prompt}</p>
  {options
   ?<div className="options" role="radiogroup" aria-label={'Alternativas para: '+q.prompt}>
     {options.map((o,i)=>{const right=answered&&o===q.answer,wrong=answered&&i===choice&&o!==q.answer;return <button key={i} type="button" role="radio" aria-checked={choice===i} disabled={answered} className={'option '+(choice===i?'on ':'')+(right?'right ':'')+(wrong?'wrong':'')} onClick={()=>setChoice(i)}><span className="letter">{LETTERS[i]}</span><span>{o}</span></button>})}
     {!answered&&<div className="row"><button className="btn sm" disabled={busy||choice===null} onClick={()=>check()}>Corrigir</button>{voice.supported&&<button type="button" className={'icon-btn '+(voice.listening?'rec':'')} aria-label={voice.listening?'Parar':'Responder falando (diga a letra)'} onClick={()=>voice.listening?voice.stop():voice.listen(t=>{const i=matchSpokenOption(t,options);if(i===null)setError(`Não entendi “${t}”. Diga, por exemplo, “letra B”.`);else setChoice(i)})}>{voice.listening?<Square size={16}/>:<Mic size={16}/>}</button>}</div>}
    </div>
   :<form className="answer-bar" onSubmit={check}>
     <input value={reply} onChange={e=>setReply(e.target.value)} placeholder="Sua resposta" aria-label={'Resposta para: '+q.prompt}/>
     {voice.supported&&<button type="button" className={'icon-btn '+(voice.listening?'rec':'')} aria-label={voice.listening?'Parar ditado':'Responder falando'} onClick={()=>voice.listening?voice.stop():voice.listen(t=>setReply(v=>(v?v+' ':'')+t))}>{voice.listening?<Square size={16}/>:<Mic size={16}/>}</button>}
     <button className="btn sm" disabled={busy||!reply.trim()}>Corrigir</button>
    </form>}
  {result&&<div className="feedback"><Verdict result={result}/><p><b>Gabarito:</b> {options?`${LETTERS[options.indexOf(q.answer)]??''}) `:''}{q.answer}</p>{q.explanation&&<p className="note">{q.explanation}</p>}
   {options&&<button className="link" onClick={()=>{setResult(null);setChoice(null)}}><RotateCcw size={13}/> Tentar de novo</button>}</div>}
  <div className="q-foot">
   <div className="row">{videos.map(v=><a key={v.id} className="link" href={v.url} target="_blank" rel="noopener noreferrer" title={v.provider}><Play size={13}/> {v.title}</a>)}</div>
   <button className="link danger-link" onClick={async()=>{if(confirm('Excluir esta questão?'))await post('/api/study',{op:'delete',table:'question',id:q.id})}}><Trash2 size={13}/> Excluir</button>
  </div>
  {q.source&&<small className="source">Fonte: {q.source}</small>}
 </article>;
}

function Flashcards({questions}:{questions:Question[]}){
 const [deck,setDeck]=useState(questions),[i,setI]=useState(0),[flipped,setFlipped]=useState(false);
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement)return;if(e.key===' '){e.preventDefault();setFlipped(f=>!f)}if(e.key==='ArrowRight'){setI(v=>Math.min(v+1,deck.length-1));setFlipped(false)}if(e.key==='ArrowLeft'){setI(v=>Math.max(v-1,0));setFlipped(false)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[deck.length]);
 if(!deck.length)return <p className="note center card">Nenhuma questão para este filtro.</p>;
 const q=deck[Math.min(i,deck.length-1)];
 const move=(d:number)=>{setI(v=>Math.max(0,Math.min(deck.length-1,v+d)));setFlipped(false)};
 return <div className="stack center-items">
  <button className={'flashcard '+(flipped?'flipped':'')} onClick={()=>setFlipped(f=>!f)} aria-label={flipped?'Mostrar pergunta':'Mostrar resposta'}>
   <div className="face front"><small className="eyebrow">{q.subject} · pergunta</small><p>{q.prompt}</p><span className="note">Toque para ver a resposta</span></div>
   <div className="face back"><small className="eyebrow">resposta</small><p>{q.answer}</p>{q.explanation&&<span className="note">{q.explanation}</span>}</div>
  </button>
  <div className="row center">
   <button className="btn secondary" onClick={()=>move(-1)} disabled={i===0}>Anterior</button>
   <span className="note">{i+1} de {deck.length}</span>
   <button className="btn secondary" onClick={()=>move(1)} disabled={i>=deck.length-1}>Próximo <ChevronRight size={15}/></button>
   <button className="icon-btn" aria-label="Embaralhar" onClick={()=>{setDeck(shuffle(deck));setI(0);setFlipped(false)}}><Shuffle size={16}/></button>
  </div>
  <p className="note">Atalhos: espaço vira o cartão, setas navegam.</p>
 </div>;
}

function Exercises({study,onCreated}:{study:Study;onCreated:()=>void}){
 const {data,ready,busy,post,setMessage}=study;
 const [subject,setSubject]=useState(subjects[0]),[topic,setTopic]=useState(curriculum[subjects[0]][0]),[custom,setCustom]=useState(''),[materialId,setMaterialId]=useState(''),[count,setCount]=useState(5);
 const chosen=custom.trim()||topic;
 return <div className="bento">
  <section className="card">
   <h2 className="display"><span className="dim">Gere com IA</span> no seu nível.</h2>
   <Spark/>
   <div className="form">
    <select className="field" aria-label="Disciplina" value={subject} onChange={e=>{setSubject(e.target.value);setTopic(curriculum[e.target.value][0])}}>{subjects.map(s=><option key={s}>{s}</option>)}</select>
    <select className="field" aria-label="Tema" value={topic} onChange={e=>setTopic(e.target.value)}>{curriculum[subject].map(s=><option key={s}>{s}</option>)}</select>
    <input className="field" aria-label="Outro tema" placeholder="Ou escreva outro tema" maxLength={160} value={custom} onChange={e=>setCustom(e.target.value)}/>
    <select className="field" aria-label="Usar material como base" value={materialId} onChange={e=>setMaterialId(e.target.value)}><option value="">Sem material de base</option>{data.materials.filter(m=>m.content).map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select>
    <div className="row"><label className="field-label">Quantidade<select className="field" value={count} onChange={e=>setCount(Number(e.target.value))}>{[3,5,10].map(n=><option key={n} value={n}>{n} questões</option>)}</select></label></div>
    <button className="btn" disabled={busy||!ready} onClick={async()=>{const x=await post('/api/ai',{op:'generate',subject,topic:chosen,materialId,count});if(x){setMessage(`${x.count} questões criadas sobre ${chosen}. Revise o gabarito antes de usar em avaliação formal.`);onCreated()}}}>{busy?'Gerando…':`Gerar ${count} questões`}</button>
    {!ready&&<p className="pending">A geração com IA fica disponível quando a chave da API for configurada.</p>}
   </div>
  </section>
  <section className="card">
   <h2 className="display">Tem uma pergunta boa? <span className="dim">Guarde aqui.</span></h2>
   <Spark/>
   <form className="form" onSubmit={async e=>{e.preventDefault();const f=e.currentTarget;const x=await post('/api/study',{op:'question',subject,topic:chosen,...Object.fromEntries(new FormData(f).entries())});if(x){f.reset();setMessage('Questão adicionada ao seu banco.')}}}>
    <p className="note">Será salva em {subject} · {chosen}.</p>
    <textarea className="field" name="prompt" rows={3} placeholder="Pergunta" aria-label="Pergunta" required/>
    <input className="field" name="answer" placeholder="Resposta esperada" aria-label="Resposta esperada" required/>
    <button className="btn secondary" disabled={busy}>Adicionar questão</button>
   </form>
   <button className="link" onClick={async()=>{const x=await post('/api/study',{op:'seed'});if(x)setMessage(x.count?`${x.count} questões do banco inicial restauradas.`:String(x.notice))}}><RotateCcw size={13}/> Restaurar banco inicial</button>
  </section>
 </div>;
}
