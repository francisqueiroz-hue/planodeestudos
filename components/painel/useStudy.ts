'use client';
import {useCallback,useEffect,useState} from 'react';
import {type ChatMessage,type Question,type RecordList,type Result,type StudySession,errorOf,json,optionsOf,readJSON} from './shared';

const empty:RecordList={materials:[],plans:[],topics:[],questions:[],attempts:[],resources:[]};

// Estado e chamadas à API compartilhados pelas seções do painel.
export function useStudy(onExpired:()=>void){
 const [data,setData]=useState<RecordList>(empty);
 const [loaded,setLoaded]=useState(false),[busy,setBusy]=useState(false);
 const [error,setError]=useState(''),[message,setMessage]=useState('');
 const [ready,setReady]=useState(false),[chat,setChat]=useState<ChatMessage[]>([]),[sessions,setSessions]=useState<StudySession[]>([]);

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

 const post=useCallback(async(url:string,payload:object,opts:{reload?:boolean}={})=>{
  setBusy(true);setError('');setMessage('');
  try{
   const r=await fetch(url,{method:'POST',headers:json,body:JSON.stringify(payload)});
   if(r.status===401){onExpired();return null}
   const x=await readJSON(r);if(!r.ok)throw Error(String(x.error||'Falha na operação'));
   if(opts.reload!==false)await load();
   return x;
  }catch(e){setError(errorOf(e,'Falha na operação'));return null}finally{setBusy(false)}
 },[load,onExpired]);

 const upload=useCallback(async(form:FormData)=>{
  setBusy(true);setError('');setMessage('');
  try{
   const r=await fetch('/api/file',{method:'POST',body:form});
   if(r.status===401){onExpired();return null}
   const x=await readJSON(r);if(!r.ok)throw Error(String(x.error||'Falha no envio'));
   await load();return x as {ok:boolean;processed:boolean;readError:string;id?:string};
  }catch(e){setError(errorOf(e,'Falha no envio'));return null}finally{setBusy(false)}
 },[load,onExpired]);

 // Múltipla escolha é corrigida pelo gabarito; questões abertas usam a IA quando disponível
 // e, sem IA, a comparação literal do servidor.
 const grade=useCallback(async(q:Question,response:string):Promise<Result|null>=>{
  const text=response.trim();if(!text){setError('Escolha, escreva ou fale sua resposta.');return null}
  const useAI=ready&&!optionsOf(q);
  const x=await post(useAI?'/api/ai':'/api/study',{op:useAI?'grade':'attempt',questionId:q.id,response:text});
  if(!x)return null;
  if(optionsOf(q))return {verdict:x.verdict==='correct'?'correct':'incorrect',feedback:x.verdict==='correct'?'Você escolheu a alternativa correta.':'Não é essa. Veja a explicação abaixo.'};
  return {verdict:(x.verdict as Result['verdict'])||'review',feedback:String(x.feedback||'')};
 },[post,ready]);

 return {data,setData,loaded,busy,error,setError,message,setMessage,ready,chat,sessions,load,post,upload,grade};
}

export type Study=ReturnType<typeof useStudy>;
