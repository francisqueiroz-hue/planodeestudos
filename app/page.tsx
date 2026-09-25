'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {curriculum} from '../lib/curriculum';

type User={id:string;email:string;name:string};
type Material={id:string;title:string;kind:string;content:string;objectKey:string|null};
type Plan={id:string;title:string;examDate:string|null;target:string|null};
type Topic={id:string;planId:string;title:string;status:string;position:number;week:number};
type Question={id:string;prompt:string;answer:string;topicLabel:string|null;subject:string|null;explanation:string|null;source:string|null};
type Attempt={id:string;questionId:string;correct:boolean};
type Resource={id:string;subject:string;topic:string;title:string;provider:string;kind:string;url:string};
type ChatMessage={id:string;role:string;content:string};
type StudySession={id:string;subject:string;durationSeconds:number;createdAt:number};
type Result={verdict:string;feedback:string};
type RecordList={materials:Material[];plans:Plan[];topics:Topic[];questions:Question[];attempts:Attempt[];resources:Resource[]};

const empty:RecordList={materials:[],plans:[],topics:[],questions:[],attempts:[],resources:[]};
const tabs=['Visão geral','Materiais','Plano de estudos','Questões','Tutor de IA'];
const subjects=Object.keys(curriculum);
const json={'Content-Type':'application/json'};

async function readJSON(r:Response){try{return await r.json() as Record<string,unknown>}catch{return {}}}
function errorOf(e:unknown,fallback:string){return e instanceof Error&&e.message?e.message:fallback}

// Associa rótulos curtos do banco inicial aos temas da trilha (para achar vídeos relacionados).
const topicAliases:Record<string,string>={'Potenciação':'Potenciação e radiciação','Porcentagens':'Porcentagens e juros simples','Equações':'Equações do 1º grau e sistemas','Geometria':'Geometria: ângulos, polígonos e congruência','Lua':'Sistema Sol, Terra e Lua','Energia':'Fontes e transformação de energia'};
function topicFor(q:Question){const label=q.topicLabel||'';return topicAliases[label]||label}

// ---------- Voz no navegador (Web Speech API: sem custo e sem enviar áudio ao servidor) ----------
type Recognition={lang:string;interimResults:boolean;continuous:boolean;start():void;stop():void;onresult:((e:{results:ArrayLike<ArrayLike<{transcript:string}>>})=>void)|null;onerror:((e:{error:string})=>void)|null;onend:(()=>void)|null};
function recognitionClass():(new()=>Recognition)|null{
 if(typeof window==='undefined')return null;
 const w=window as unknown as {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};
 return w.SpeechRecognition||w.webkitSpeechRecognition||null;
}

export default function Home(){
 const [user,setUser]=useState<User|null>(null);
 const [checking,setChecking]=useState(true);
 useEffect(()=>{fetch('/api/auth').then(readJSON).then(x=>setUser((x.user as User)||null)).catch(()=>setUser(null)).finally(()=>setChecking(false))},[]);
 async function logout(){await fetch('/api/auth',{method:'POST',headers:json,body:JSON.stringify({op:'logout'})}).catch(()=>{});setUser(null)}
 return <>
  <header className="top"><div className="wrap nav"><a className="logo" href="#painel">✦ Painel <b>de Estudos</b></a>
   <div className="nav-user">{user?<><span className="micro">Olá, {user.name}</span><button className="btn secondary mini" onClick={logout}>Sair</button></>:<span className="micro">8º ano · Ensino Fundamental</span>}</div>
  </div></header>
  <main className="wrap">
   {checking?<p className="helper" style={{padding:'60px 0'}} role="status">Carregando…</p>:user?<Dashboard key={user.id} onExpired={()=>setUser(null)}/>:<AuthScreen onLogin={setUser}/>}
  </main>
  <footer className="footer">Painel de Estudos · 8º ano · <a href="https://basenacionalcomum.mec.gov.br/" target="_blank" rel="noreferrer">Referência curricular: BNCC</a></footer>
 </>;
}

function AuthScreen({onLogin}:{onLogin:(u:User)=>void}){
 const [mode,setMode]=useState<'login'|'register'>('login');
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
 return <section className="auth">
  <div className="study-top"><span className="micro-label">Seu espaço de aprendizado</span><h1>Organize seus estudos do 8º ano</h1><p>Plano por temas, banco de questões com gabarito, tutor com IA e controle do tempo de estudo.</p></div>
  <div className="panel auth-card">
   <div className="choice" role="tablist">{(['login','register'] as const).map(m=><button key={m} role="tab" aria-selected={mode===m} className={mode===m?'on':''} onClick={()=>{setMode(m);setError('')}}>{m==='login'?'Entrar':'Criar conta'}</button>)}</div>
   <form className="fields" style={{marginTop:20}} onSubmit={submit}>
    {mode==='register'&&<input name="name" placeholder="Seu nome" aria-label="Nome" autoComplete="name" required maxLength={80}/>}
    <input name="email" type="email" placeholder="E-mail" aria-label="E-mail" autoComplete="email" required/>
    <input name="password" type="password" placeholder={mode==='register'?'Senha (8+ caracteres, letras e números)':'Senha'} aria-label="Senha" autoComplete={mode==='register'?'new-password':'current-password'} required minLength={mode==='register'?8:1}/>
    {error&&<p className="error" role="alert">{error}</p>}
    <button className="btn" disabled={busy}>{busy?'Aguarde…':mode==='login'?'Entrar':'Criar conta'}</button>
   </form>
   {mode==='register'&&<p className="helper">Estudantes menores de idade devem criar a conta com o acompanhamento de um responsável. Guardamos apenas nome, e-mail e seus registros de estudo.</p>}
  </div>
 </section>;
}

function Dashboard({onExpired}:{onExpired:()=>void}){
 const [tab,setTab]=useState('Visão geral'),[data,setData]=useState<RecordList>(empty),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false);
 const [ready,setReady]=useState(false),[chat,setChat]=useState<ChatMessage[]>([]),[sessions,setSessions]=useState<StudySession[]>([]),[pending,setPending]=useState('');
 const [subject,setSubject]=useState(subjects[0]),[topic,setTopic]=useState(curriculum[subjects[0]][0]),[materialId,setMaterialId]=useState(''),[mode,setMode]=useState('Quiz');
 const [replies,setReplies]=useState<Record<string,string>>({}),[results,setResults]=useState<Record<string,Result>>({}),[reveal,setReveal]=useState<Record<string,boolean>>({});
 const [prompt,setPrompt]=useState(''),[recording,setRecording]=useState(false),[timer,setTimer]=useState(0),[timing,setTiming]=useState(false),[filterTopic,setFilterTopic]=useState(''),[filterSubject,setFilterSubject]=useState('');
 const recognition=useRef<Recognition|null>(null),chatEnd=useRef<HTMLDivElement|null>(null);

 const load=useCallback(async()=>{
  try{
   const [a,b]=await Promise.all([fetch('/api/study'),fetch('/api/ai')]);
   if(a.status===401){onExpired();return}
   const x=await readJSON(a),y=await readJSON(b);
   if(!a.ok)throw Error(String(x.error||'Erro ao carregar'));
   setData(x as unknown as RecordList);
   if(b.ok){setReady(Boolean(y.ready));setChat(y.chat as ChatMessage[]);setSessions(y.sessions as StudySession[])}
  }catch(e){setError(errorOf(e,'Erro ao carregar'))}finally{setLoaded(true)}
 },[onExpired]);
 useEffect(()=>{const t=setTimeout(load,0);return()=>clearTimeout(t)},[load]);
 useEffect(()=>{if(!timing)return;const id=setInterval(()=>setTimer(v=>v+1),1000);return()=>clearInterval(id)},[timing]);
 useEffect(()=>{chatEnd.current?.scrollIntoView({block:'end'})},[chat,pending]);
 useEffect(()=>()=>{recognition.current?.stop();if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel()},[]);

 async function post(url:string,payload:object){
  setBusy(true);setError('');setMessage('');
  try{
   const r=await fetch(url,{method:'POST',headers:json,body:JSON.stringify(payload)});
   if(r.status===401){onExpired();return null}
   const x=await readJSON(r);if(!r.ok)throw Error(String(x.error||'Falha na operação'));
   await load();return x;
  }catch(e){setError(errorOf(e,'Falha na operação'));return null}finally{setBusy(false)}
 }
 async function submit(e:React.FormEvent<HTMLFormElement>,op:string){e.preventDefault();const f=e.currentTarget;const result=await post('/api/study',{op,...Object.fromEntries(new FormData(f).entries())});if(result){f.reset();setMessage('Salvo com sucesso.')}}
 async function remove(table:string,id:string,label:string){if(confirm(`Excluir ${label}? Esta ação não pode ser desfeita.`))await post('/api/study',{op:'delete',table,id})}
 async function upload(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();const f=e.currentTarget;setBusy(true);setError('');setMessage('');
  try{
   const r=await fetch('/api/file',{method:'POST',body:new FormData(f)});
   if(r.status===401){onExpired();return}
   const x=await readJSON(r);if(!r.ok)throw Error(String(x.error||'Falha no envio'));
   f.reset();setMessage(x.processed?'Arquivo lido automaticamente. Confira o conteúdo extraído.':x.readError?`Arquivo salvo, mas a leitura falhou: ${x.readError}`:'Arquivo salvo. Use “Ler com IA” para tentar a leitura.');await load();
  }catch(err){setError(errorOf(err,'Falha no envio'))}finally{setBusy(false)}
 }
 async function ask(e:React.FormEvent){
  e.preventDefault();const q=prompt.trim();if(!q||busy)return;
  recognition.current?.stop();setPrompt('');setPending(q);
  const x=await post('/api/ai',{op:'chat',prompt:q,materialId});
  setPending('');if(!x)setPrompt(q);
 }
 async function grade(q:Question){
  const response=replies[q.id]?.trim();if(!response){setError('Escreva sua resposta.');return}
  const x=await post(ready?'/api/ai':'/api/study',{op:ready?'grade':'attempt',questionId:q.id,response});
  if(x){setResults(v=>({...v,[q.id]:x as unknown as Result}));setReveal(v=>({...v,[q.id]:true}))}
 }
 function startVoice(){
  const Rec=recognitionClass();
  if(!Rec){setError('Ditado por voz indisponível neste navegador. Use Chrome, Edge ou Safari.');return}
  const rec=new Rec();rec.lang='pt-BR';rec.interimResults=false;rec.continuous=false;
  rec.onresult=e=>{const said=Array.from(e.results).map(r=>r[0]?.transcript||'').join(' ').trim();if(said)setPrompt(v=>v+(v?' ':'')+said)};
  rec.onerror=e=>{if(e.error==='not-allowed')setError('Permissão para o microfone não concedida.');else if(e.error!=='no-speech'&&e.error!=='aborted')setError('Não foi possível reconhecer a fala.')};
  rec.onend=()=>{setRecording(false);recognition.current=null};
  recognition.current=rec;setError('');rec.start();setRecording(true);
 }
 function speak(s:string){
  if(typeof speechSynthesis==='undefined'){setError('Leitura em voz alta indisponível neste navegador.');return}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(s.slice(0,4000));u.lang='pt-BR';
  const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('pt-br'))||speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('pt'));
  if(voice)u.voice=voice;
  speechSynthesis.speak(u);
 }
 async function saveSession(){setTiming(false);if(timer>=60){const x=await post('/api/ai',{op:'session',seconds:Math.min(timer,4*3600),subject});if(x)setMessage('Sessão de estudo registrada.')}else setMessage('Sessões com menos de 1 minuto não são registradas.');setTimer(0)}
 async function toggleTopic(t:Topic){
  const status=t.status==='done'?'pending':'done';
  const set=(v:string)=>setData(d=>({...d,topics:d.topics.map(x=>x.id===t.id?{...x,status:v}:x)}));
  set(status);
  if(!await post('/api/study',{op:'topic',id:t.id,status}))set(t.status);
 }
 function related(q:Question){return data.resources.filter(r=>r.subject===q.subject&&r.topic===topicFor(q)&&r.kind==='video')}
 function changeSubject(s:string){setSubject(s);setTopic(curriculum[s][0])}

 const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d});
 const daily=days.map(d=>sessions.filter(s=>new Date(s.createdAt).toDateString()===d.toDateString()).reduce((n,s)=>n+s.durationSeconds,0));
 const maxDaily=Math.max(...daily,1);
 const correct=data.attempts.filter(a=>a.correct).length;
 const visibleQuestions=data.questions.filter(q=>(!filterTopic||topicFor(q)===filterTopic)&&(!filterSubject||q.subject===filterSubject));
 const clock=`${Math.floor(timer/60).toString().padStart(2,'0')}:${(timer%60).toString().padStart(2,'0')}`;

 return <>
  <div className="study-top"><span className="micro-label">Seu espaço de aprendizado</span><h1>O que vamos estudar hoje?</h1><p>Escolha um tema, estude com o tutor e pratique com questões.</p></div>
  <section id="painel" className="section" style={{paddingTop:10}}><div className="workspace">
   <nav className="side" aria-label="Seções do painel">{tabs.map(t=><button key={t} className={'tab '+(tab===t?'active':'')} aria-current={tab===t?'page':undefined} onClick={()=>{setTab(t);setError('');setMessage('')}}>{t}</button>)}</nav>
   <div className="panel" aria-busy={busy}>
    {error&&<p className="error" role="alert">{error}</p>}
    {message&&<p className="success" role="status">{message}</p>}
    {!loaded&&<p className="helper" role="status">Carregando seus dados…</p>}

    {tab==='Visão geral'&&<>
     <h2>Seu progresso</h2>
     <div className="grid">
      <div className="tile"><span className="symbol">{data.materials.length}</span><h3>Materiais</h3><p>Arquivos e anotações.</p><button className="btn secondary mini" onClick={()=>setTab('Materiais')}>Adicionar</button></div>
      <div className="tile"><span className="symbol">{data.topics.filter(t=>t.status==='done').length}/{data.topics.length}</span><h3>Temas revisados</h3><p>Etapas dos seus planos.</p><button className="btn secondary mini" onClick={()=>setTab('Plano de estudos')}>Ver planos</button></div>
      <div className="tile"><span className="symbol">{data.attempts.length?`${Math.round(correct*100/data.attempts.length)}%`:'—'}</span><h3>Acertos</h3><p>{correct} de {data.attempts.length} respostas corretas.</p><button className="btn secondary mini" onClick={()=>setTab('Questões')}>Praticar</button></div>
     </div>
     <div className="study-tools">
      <select aria-label="Disciplina da sessão" value={subject} onChange={e=>changeSubject(e.target.value)}>{subjects.map(x=><option key={x}>{x}</option>)}</select>
      <button className="btn secondary mini" onClick={()=>timing?saveSession():setTiming(true)}>{timing?'Terminar estudo':'Iniciar estudo'}</button>
      <span className="helper" aria-live="off">{clock} · mínimo de 1 minuto para registrar</span>
     </div>
     <h3>Tempo de estudo · últimos 7 dias</h3>
     <div className="bar-chart" role="img" aria-label={'Minutos por dia: '+daily.map((v,i)=>days[i].toLocaleDateString('pt-BR',{weekday:'short'})+' '+Math.round(v/60)).join(', ')}>
      {daily.map((v,i)=><div className="bar-col" key={i} title={`${Math.round(v/60)} min`}><div style={{height:Math.max(2,Math.round(v/maxDaily*110))+'px'}}/><span>{days[i].toLocaleDateString('pt-BR',{weekday:'short'})}</span><small>{Math.round(v/60)} min</small></div>)}
     </div>
    </>}

    {tab==='Materiais'&&<>
     <h2>Seus materiais</h2>
     <p className="hint">PDFs e fotos de até 8 MB podem ser lidos pelo tutor. Confira a transcrição antes de estudar.</p>
     <form className="fields" onSubmit={upload}>
      <select name="kind" aria-label="Tipo de arquivo"><option>PDF</option><option>prova antiga</option><option>anotações</option></select>
      <input name="file" type="file" aria-label="Arquivo" accept=".pdf,.png,.jpg,.jpeg,.txt,application/pdf,image/png,image/jpeg,text/plain" required/>
      <button className="btn" disabled={busy}>{busy?'Enviando…':'Enviar arquivo'}</button>
     </form>
     <hr className="divider"/>
     <form className="fields" onSubmit={e=>submit(e,'material')}>
      <input name="title" placeholder="Título" aria-label="Título" required maxLength={160}/>
      <select name="kind" aria-label="Tipo"><option>anotações</option><option>prova antiga</option><option>vídeo</option><option>link</option></select>
      <textarea name="content" placeholder="Escreva uma anotação ou cole um link" aria-label="Conteúdo"/>
      <button className="btn" disabled={busy}>Salvar anotação</button>
     </form>
     {loaded&&data.materials.length===0&&<p className="helper">Nenhum material ainda. Envie um PDF, uma foto do caderno ou escreva uma anotação.</p>}
     {data.materials.map(m=><div className="item" key={m.id}><b>{m.title}</b> <small>· {m.kind}</small>
      {m.content&&<details><summary>{m.objectKey?'Conteúdo lido':'Conteúdo'}</summary><p>{m.content}</p></details>}
      <div className="actions">
       {m.objectKey&&<><a className="btn secondary mini" href={'/api/file/'+m.id}>Baixar</a><button className="btn secondary mini" disabled={busy||!ready} onClick={async()=>{const x=await post('/api/ai',{op:'extract',materialId:m.id});if(x)setMessage('Material lido. Confira o conteúdo extraído.')}}>Ler com IA</button></>}
       <button className="danger" onClick={()=>remove('material',m.id,`“${m.title}”`)}>Excluir</button>
      </div>
     </div>)}
    </>}

    {tab==='Plano de estudos'&&<>
     <h2>Plano por temas</h2>
     <p className="hint">Trilha em etapas: aula, questões e correção. Adapte o ritmo ao calendário escolar.</p>
     <div className="study-tools">
      <select aria-label="Disciplina da trilha" value={subject} onChange={e=>changeSubject(e.target.value)}>{subjects.map(x=><option key={x}>{x}</option>)}</select>
      <button className="btn mini" disabled={busy} onClick={async()=>{const x=await post('/api/study',{op:'path',subject});if(x)setMessage(String(x.notice||`Trilha de ${subject} criada com ${x.count} temas.`))}}>Criar trilha guiada</button>
      <button className="btn secondary mini" onClick={()=>{const el=document.querySelector<HTMLTextAreaElement>('[name=subjects]');if(el)el.value=curriculum[subject].join('\n')}}>Preencher temas no formulário</button>
     </div>
     <form className="fields" onSubmit={e=>submit(e,'plan')}>
      <input name="title" placeholder="Nome da prova" aria-label="Nome da prova" required maxLength={160}/>
      <label className="helper">Data da prova (opcional — os temas são distribuídos em semanas até ela)<input name="examDate" type="date" aria-label="Data da prova"/></label>
      <input name="target" placeholder="Meta pessoal (opcional)" aria-label="Meta pessoal" maxLength={80}/>
      <textarea name="subjects" placeholder="Um tema por linha" aria-label="Temas, um por linha" required/>
      <button className="btn" disabled={busy}>Criar plano</button>
     </form>
     {loaded&&data.plans.length===0&&<p className="helper">Nenhum plano ainda. Crie uma trilha guiada ou monte seu plano.</p>}
     {data.plans.map(p=>{const list=data.topics.filter(t=>t.planId===p.id);const done=list.filter(t=>t.status==='done').length;return <div className="item" key={p.id}>
      <h3>{p.title}</h3>
      <small>{p.examDate?'Prova em '+p.examDate.split('-').reverse().join('/'):'Data a definir'}{p.target?` · Meta: ${p.target}`:''} · {done}/{list.length} concluídos</small>
      <progress className="progress" max={Math.max(1,list.length)} value={done} aria-label={`Progresso: ${done} de ${list.length}`}/>
      {list.map(t=><div className="item" key={t.id}>
       <label style={{display:'flex',gap:12}}><input type="checkbox" checked={t.status==='done'} onChange={()=>toggleTopic(t)}/><b>Semana {t.week||1} · {t.title}</b></label>
       <div className="actions">
        {data.resources.filter(r=>r.topic===t.title&&r.kind!=='repository').slice(0,2).map(r=><a key={r.id} className="btn secondary mini" href={r.url} target="_blank" rel="noopener noreferrer">▶ {r.title} ↗</a>)}
        <button className="btn secondary mini" onClick={()=>{setFilterTopic(t.title);setFilterSubject('');setTab('Questões')}}>Praticar questões →</button>
       </div>
      </div>)}
      <button className="danger" onClick={()=>remove('plan',p.id,`o plano “${p.title}”`)}>Excluir plano</button>
     </div>})}
    </>}

    {tab==='Questões'&&<>
     <h2>Questões do 8º ano</h2>
     <p className="hint">Banco autoral de questões com gabaritos e explicações. Questões originais de terceiros são acessadas na fonte.</p>
     <div className="study-tools">
      <select aria-label="Filtrar por disciplina" value={filterSubject} onChange={e=>{setFilterSubject(e.target.value);setFilterTopic('')}}><option value="">Todas as disciplinas</option>{subjects.map(x=><option key={x}>{x}</option>)}</select>
      {filterTopic&&<><span className="micro">Tema: {filterTopic}</span><button className="btn secondary mini" onClick={()=>setFilterTopic('')}>Mostrar todos os temas</button></>}
      <button className="btn secondary mini" disabled={busy} onClick={async()=>{const x=await post('/api/study',{op:'seed'});if(x)setMessage(x.count?`${x.count} questões adicionadas.`:String(x.notice))}}>Restaurar banco inicial</button>
     </div>
     <details className="item"><summary><b>Criar questões</b> (com IA ou manualmente)</summary>
      <div className="study-tools">
       <select aria-label="Disciplina" value={subject} onChange={e=>changeSubject(e.target.value)}>{subjects.map(x=><option key={x}>{x}</option>)}</select>
       <select aria-label="Tema" value={curriculum[subject].includes(topic)?topic:''} onChange={e=>setTopic(e.target.value)}>{!curriculum[subject].includes(topic)&&<option value="">(tema digitado)</option>}{curriculum[subject].map(x=><option key={x}>{x}</option>)}</select>
       <input aria-label="Outro tema" placeholder="Ou digite outro tema" maxLength={160} onChange={e=>setTopic(e.target.value.trim()||curriculum[subject][0])}/>
       <select value={materialId} onChange={e=>setMaterialId(e.target.value)} aria-label="Material de referência"><option value="">Sem material</option>{data.materials.filter(x=>x.content).map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select>
       <button className="btn mini" disabled={busy||!ready} onClick={async()=>{const x=await post('/api/ai',{op:'generate',subject,topic,materialId,count:5});if(x){setFilterSubject('');setFilterTopic('');setMessage(`${x.count} questões criadas. Revise o gabarito antes de usar em avaliação formal.`)}}}>{busy?'Gerando…':'Gerar 5 questões com IA'}</button>
      </div>
      {!ready&&<p className="pending">A geração com IA será ativada quando a chave da API for configurada.</p>}
      <form className="fields" onSubmit={e=>submit(e,'question')}>
       <input type="hidden" name="subject" value={subject}/><input type="hidden" name="topic" value={topic}/>
       <textarea name="prompt" placeholder={`Escreva uma pergunta (${subject} · ${topic})`} aria-label="Pergunta" required/>
       <input name="answer" placeholder="Resposta esperada" aria-label="Resposta esperada" required/>
       <button className="btn secondary" disabled={busy}>Adicionar questão manual</button>
      </form>
     </details>
     <div className="choice" style={{margin:'18px 0'}}>{['Quiz','Flashcards'].map(x=><button key={x} className={mode===x?'on':''} aria-pressed={mode===x} onClick={()=>setMode(x)}>{x}</button>)}</div>
     {!ready&&mode==='Quiz'&&<p className="helper">Sem IA configurada, a correção compara o texto com o gabarito (ignora acentos e maiúsculas). Respostas equivalentes com outras palavras aparecem como “revisar”.</p>}
     {loaded&&visibleQuestions.length===0&&<p className="helper">Nenhuma questão para este filtro.</p>}
     {visibleQuestions.map(q=>{const res=results[q.id];return <div className="item" key={q.id}>
      <small>{q.subject||'Questão manual'} · {q.topicLabel||'Tema livre'} · {q.source||'Criada por você'}</small>
      <p><b>{q.prompt}</b></p>
      {mode==='Flashcards'
       ?<button className="btn secondary mini" onClick={()=>setReveal(v=>({...v,[q.id]:!v[q.id]}))}>{reveal[q.id]?'Ocultar resposta':'Ver resposta'}</button>
       :<form className="actions" onSubmit={e=>{e.preventDefault();grade(q)}}><input className="response" style={{maxWidth:440}} value={replies[q.id]||''} onChange={e=>setReplies(v=>({...v,[q.id]:e.target.value}))} placeholder="Sua resposta" aria-label={'Resposta para '+q.prompt}/><button className="btn secondary mini" disabled={busy}>Corrigir resposta</button></form>}
      {related(q).slice(0,1).map(r=><div className="actions" key={r.id}><a className="btn secondary mini" href={r.url} target="_blank" rel="noopener noreferrer">▶ Aula relacionada: {r.title} ↗</a></div>)}
      {reveal[q.id]&&<div className="item">
       {res&&<p className={'verdict '+res.verdict}><b>{res.verdict==='correct'?'✓ Correta':res.verdict==='incorrect'?'✗ Incorreta':'↻ Revisar'}:</b> {res.feedback}</p>}
       <p><b>Gabarito:</b> {q.answer}</p>{q.explanation&&<p>{q.explanation}</p>}
      </div>}
      <button className="danger" onClick={()=>remove('question',q.id,'esta questão')}>Excluir</button>
     </div>})}
     <h3>Acervos externos e soluções</h3>
     <div className="grid">{data.resources.filter(r=>r.kind==='repository').map(r=><div className="tile" key={r.id}><h3>{r.title}</h3><p>{r.provider}</p><a className="btn secondary mini" href={r.url} target="_blank" rel="noopener noreferrer">Abrir acervo ↗</a></div>)}</div>
     <p className="helper">Enunciados e vídeos externos permanecem nos sites dos titulares.</p>
    </>}

    {tab==='Tutor de IA'&&<>
     <h2>Tutor de IA</h2>
     <p className="hint">Pergunte por texto ou voz. O tutor explica passo a passo e pode usar um material previamente lido.</p>
     <div className="study-tools">
      <select value={materialId} onChange={e=>setMaterialId(e.target.value)} aria-label="Material para o tutor"><option value="">Sem material selecionado</option>{data.materials.filter(m=>m.content).map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select>
      {chat.length>0&&<button className="btn secondary mini" disabled={busy} onClick={async()=>{if(confirm('Apagar toda a conversa com o tutor?')){const x=await post('/api/ai',{op:'clear'});if(x)setMessage('Conversa apagada.')}}}>Limpar conversa</button>}
     </div>
     <div className="chat-box" aria-live="polite">
      {chat.length===0&&!pending&&<p className="helper">Exemplo: “Explique porcentagem com uma situação do cotidiano.”</p>}
      {chat.map(m=><div className={'bubble '+(m.role==='user'?'user':'assistant')} key={m.id}>{m.content}{m.role==='assistant'&&<div className="audio-actions"><button className="btn secondary mini" onClick={()=>speak(m.content)}>🔊 Ouvir</button></div>}</div>)}
      {pending&&<><div className="bubble user">{pending}</div><div className="bubble assistant helper">O tutor está pensando…</div></>}
      <div ref={chatEnd}/>
     </div>
     <form onSubmit={ask} className="fields" style={{marginTop:14}}>
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(e)}}} placeholder="Faça uma pergunta… (Enter envia, Shift+Enter quebra linha)" aria-label="Pergunta ao tutor" maxLength={3000}/>
      <div className="audio-actions">
       <button type="button" className="btn secondary mini" disabled={busy} onClick={()=>recording?recognition.current?.stop():startVoice()}>{recording?'⏹ Parar ditado':'🎙 Falar'}</button>
       <button className="btn" disabled={busy||!ready||!prompt.trim()}>{busy&&pending?'Enviando…':'Enviar'}</button>
      </div>
     </form>
     {!ready&&<p className="pending">O tutor será ativado quando a chave da API de IA for configurada.</p>}
     <p className="helper">O ditado e a leitura em voz alta usam os recursos do próprio navegador. Respostas da IA podem conter erros; confira informações importantes com o professor.</p>
    </>}
   </div>
  </div></section>
 </>;
}
