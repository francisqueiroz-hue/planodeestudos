'use client';
import {useState} from 'react';
import {Download,FileText,Headphones,Square,Trash2,Upload,WandSparkles} from 'lucide-react';
import {Spark,useVoice} from './shared';
import type {Study} from './useStudy';

// Ilustração própria: celular enquadrando uma equação escrita à mão.
export function ScanIllustration(){
 return <div className="scan" aria-hidden="true">
  <div className="phone"><div className="notch"/>
   <div className="paper">
    <svg viewBox="0 0 200 330" className="ink">
     <text x="16" y="52" className="hand">a² + b² = c²</text>
     <text x="112" y="96" className="hand small">x = 5</text>
     <path d="M20 250 L70 190 L120 250 Z" className="stroke"/>
     <text x="150" y="292" className="hand small">π r²</text>
    </svg>
    <div className="frame"><span>3x + 5 = 20</span></div>
   </div>
   <div className="shutter"/>
  </div>
 </div>;
}

export function MaterialsSection({study}:{study:Study}){
 const {data,busy,ready,post,upload,setMessage,setError,loaded}=study;
 const voice=useVoice(setError);
 const [reading,setReading]=useState('');

 async function send(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();const f=e.currentTarget;
  const x=await upload(new FormData(f));
  if(x){f.reset();setMessage(x.processed?'Arquivo lido. Confira o conteúdo extraído.':x.readError?`Arquivo salvo, mas a leitura falhou: ${x.readError}`:'Arquivo salvo. Use “Ler com IA” quando quiser.')}
 }
 async function note(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();const f=e.currentTarget;
  const x=await post('/api/study',{op:'material',...Object.fromEntries(new FormData(f).entries())});
  if(x){f.reset();setMessage('Anotação salva.')}
 }
 function listen(id:string,text:string){if(reading===id){voice.silence();setReading('');return}setReading(id);voice.speak(text,()=>setReading(''))}

 return <div className="stack">
  <header className="page-head"><h1 className="display xl">Seu material, <span className="dim">organizado e pronto pra revisar.</span></h1></header>
  <div className="bento">
   <section className="card">
    <h2 className="display"><span className="dim">Travou num exercício?</span> Fotografe ou envie o PDF.</h2>
    <Spark/>
    <ScanIllustration/>
    <form className="form" onSubmit={send}>
     <div className="row">
      <select className="field" name="kind" aria-label="Tipo de arquivo"><option>PDF</option><option>prova antiga</option><option>anotações</option></select>
      <label className="file-pick"><Upload size={15}/><input name="file" type="file" aria-label="Arquivo" accept=".pdf,.png,.jpg,.jpeg,.txt,application/pdf,image/png,image/jpeg,text/plain" required/></label>
     </div>
     <button className="btn" disabled={busy}>{busy?'Enviando…':'Enviar'}</button>
     <p className="note">PDF, foto ou TXT até 15 MB. {ready?'A IA transcreve e organiza arquivos de até 8 MB.':'A leitura automática fica disponível com a IA configurada.'}</p>
    </form>
   </section>
   <section className="card">
    <h2 className="display">Resumo seu, <span className="dim">em voz alta quando quiser.</span></h2>
    <Spark/>
    <form className="form" onSubmit={note}>
     <input className="field" name="title" placeholder="Título" aria-label="Título" required maxLength={160}/>
     <select className="field" name="kind" aria-label="Tipo"><option>anotações</option><option>prova antiga</option><option>vídeo</option><option>link</option></select>
     <textarea className="field" name="content" rows={6} placeholder="Escreva um resumo ou cole um link" aria-label="Conteúdo"/>
     <button className="btn secondary" disabled={busy}>Salvar anotação</button>
    </form>
   </section>
  </div>

  {loaded&&data.materials.length===0&&<p className="note center">Nenhum material ainda.</p>}
  <div className="materials">{data.materials.map(m=><article className="card material" key={m.id}>
   <div className="material-head"><span className="mode-icon"><FileText size={16}/></span><div><b>{m.title}</b><small>{m.kind}{m.objectKey?' · arquivo':''}</small></div></div>
   {m.content?<details><summary>{m.objectKey?'Conteúdo lido':'Conteúdo'}</summary><p>{m.content}</p></details>:<p className="note">{m.objectKey?'Ainda não lido.':'Sem conteúdo.'}</p>}
   <div className="row">
    {m.content&&<button className="link" onClick={()=>listen(m.id,m.content)}>{reading===m.id?<><Square size={13}/> Parar</>:<><Headphones size={13}/> Ouvir</>}</button>}
    {m.objectKey&&<a className="link" href={'/api/file/'+m.id}><Download size={13}/> Baixar</a>}
    {m.objectKey&&<button className="link" disabled={busy||!ready} onClick={async()=>{const x=await post('/api/ai',{op:'extract',materialId:m.id});if(x)setMessage('Material lido. Confira o conteúdo extraído.')}}><WandSparkles size={13}/> Ler com IA</button>}
    <button className="link danger-link" onClick={async()=>{if(confirm(`Excluir “${m.title}”?`))await post('/api/study',{op:'delete',table:'material',id:m.id})}}><Trash2 size={13}/> Excluir</button>
   </div>
  </article>)}</div>
 </div>;
}
