'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUp,Camera,Mic,Paperclip,Square,Volume2,Trash2,X} from 'lucide-react';
import {Orb,Spark,useVoice,type OrbState} from './shared';
import type {Study} from './useStudy';

const starters=['Explique porcentagem com um exemplo de desconto no mercado.','Como resolvo um sistema pelo método da substituição?','Qual a diferença entre voz ativa e voz passiva?','Por que a Lua tem fases?'];

export function TutorSection({study}:{study:Study}){
 const {chat,post,busy,ready,data,upload,setMessage,setError}=study;
 const voice=useVoice(setError);
 const [prompt,setPrompt]=useState(''),[pending,setPending]=useState(''),[materialId,setMaterialId]=useState('');
 const end=useRef<HTMLDivElement|null>(null),camera=useRef<HTMLInputElement|null>(null);
 useEffect(()=>{end.current?.scrollIntoView({block:'end',behavior:'smooth'})},[chat.length,pending]);
 const material=data.materials.find(m=>m.id===materialId);

 async function ask(text=prompt){
  const q=text.trim();if(!q||busy)return;
  voice.stop();setPrompt('');setPending(q);
  const x=await post('/api/ai',{op:'chat',prompt:q,materialId});
  setPending('');if(!x)setPrompt(q);
 }
 async function photo(file:File|undefined){
  if(!file)return;
  const f=new FormData();f.set('kind','anotações');f.set('file',file,file.name||'foto.jpg');
  const x=await upload(f);
  if(!x)return;
  if(x.id&&x.processed){setMaterialId(x.id);setPrompt('Me ajude a entender e resolver o problema da foto, passo a passo.');setMessage('Foto lida. Envie a pergunta para o tutor.')}
  else setMessage(x.readError?`Foto salva, mas a leitura falhou: ${x.readError}`:'Foto salva em Materiais.');
 }

 const state:OrbState=voice.listening?'listening':voice.speaking?'speaking':pending?'thinking':'idle';
 const status=voice.listening?'O tutor está ouvindo':pending?'O tutor está pensando':voice.speaking?'O tutor está falando':ready?'Pergunte, fale ou mande uma foto':'Tutor aguardando a configuração da IA';

 return <div className="stack">
  <header className="page-head"><h1 className="display xl"><span className="dim">Pergunte qualquer coisa,</span> na hora em que travar.</h1></header>
  <section className="card wide tutor">
   <Spark/>
   <Orb state={state} size={chat.length||pending?96:140}/>
   <p className="orb-status" aria-live="polite">{status}</p>

   {(chat.length>0||pending)&&<div className="chat" aria-live="polite">
    {chat.map(m=><div className={'bubble '+(m.role==='user'?'user':'assistant')} key={m.id}>{m.content}
     {m.role==='assistant'&&<button className="link" onClick={()=>voice.speaking?voice.silence():voice.speak(m.content)}><Volume2 size={13}/> {voice.speaking?'Parar':'Ouvir'}</button>}</div>)}
    {pending&&<><div className="bubble user">{pending}</div><div className="bubble assistant typing" aria-label="Pensando"><i/><i/><i/></div></>}
    <div ref={end}/>
   </div>}

   {chat.length===0&&!pending&&<div className="chips center">{starters.map(s=><button key={s} className="chip" disabled={!ready||busy} onClick={()=>ask(s)}>{s}</button>)}</div>}

   <form className="composer" onSubmit={e=>{e.preventDefault();ask()}}>
    {material&&<span className="chip on attach">Usando: {material.title}<button type="button" aria-label="Remover material" onClick={()=>setMaterialId('')}><X size={12}/></button></span>}
    <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask()}}} rows={1} placeholder="Pergunte, fale ou tire uma foto" aria-label="Pergunta ao tutor" maxLength={3000}/>
    <div className="composer-tools">
     <label className="icon-btn" title="Usar um material como base">
      <Paperclip size={16}/><span className="sr-only">Material de apoio</span>
      <select aria-label="Material de apoio" value={materialId} onChange={e=>setMaterialId(e.target.value)}><option value="">Sem material</option>{data.materials.filter(m=>m.content).map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select>
     </label>
     <button type="button" className="icon-btn" aria-label="Fotografar um exercício" disabled={busy||!ready} onClick={()=>camera.current?.click()}><Camera size={16}/></button>
     <input ref={camera} type="file" accept="image/png,image/jpeg" capture="environment" hidden onChange={e=>{photo(e.target.files?.[0]);e.target.value=''}}/>
     <span className="grow"/>
     {voice.supported&&<button type="button" className={'icon-btn '+(voice.listening?'rec':'')} aria-label={voice.listening?'Parar ditado':'Falar'} onClick={()=>voice.listening?voice.stop():voice.listen(t=>setPrompt(v=>(v?v+' ':'')+t))}>{voice.listening?<Square size={16}/>:<Mic size={16}/>}</button>}
     <button className="send" aria-label="Enviar" disabled={busy||!ready||!prompt.trim()}><ArrowUp size={18}/></button>
    </div>
   </form>
   <div className="row center">
    {chat.length>0&&<button className="link" disabled={busy} onClick={async()=>{if(confirm('Apagar toda a conversa com o tutor?')){const x=await post('/api/ai',{op:'clear'});if(x)setMessage('Conversa apagada.')}}}><Trash2 size={13}/> Limpar conversa</button>}
   </div>
   <p className="note center">Voz pelo próprio navegador. A IA pode errar: confira o que for importante com seu professor.</p>
  </section>
 </div>;
}
