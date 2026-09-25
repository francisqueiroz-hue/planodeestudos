'use client';
import {useCallback,useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {Sparkle} from 'lucide-react';

export type User={id:string;email:string;name:string};
export type Material={id:string;title:string;kind:string;content:string;objectKey:string|null;createdAt:number};
export type Plan={id:string;title:string;examDate:string|null;target:string|null};
export type Topic={id:string;planId:string;title:string;status:string;position:number;week:number};
export type Question={id:string;prompt:string;answer:string;topicLabel:string|null;subject:string|null;explanation:string|null;source:string|null;options:string|null;difficulty:number|null};
export type Attempt={id:string;questionId:string;correct:boolean;createdAt:number};
export type Resource={id:string;subject:string;topic:string;title:string;provider:string;kind:string;url:string};
export type ChatMessage={id:string;role:string;content:string};
export type StudySession={id:string;subject:string;durationSeconds:number;createdAt:number};
export type Result={verdict:'correct'|'incorrect'|'review';feedback:string};
export type RecordList={materials:Material[];plans:Plan[];topics:Topic[];questions:Question[];attempts:Attempt[];resources:Resource[]};

export const json={'Content-Type':'application/json'};
export async function readJSON(r:Response){try{return await r.json() as Record<string,unknown>}catch{return {}}}
export function errorOf(e:unknown,fallback:string){return e instanceof Error&&e.message?e.message:fallback}

// Associa rótulos curtos do banco inicial aos temas da trilha (para achar vídeos relacionados).
const topicAliases:Record<string,string>={'Potenciação':'Potenciação e radiciação','Porcentagens':'Porcentagens e juros simples','Equações':'Equações do 1º grau e sistemas','Geometria':'Geometria: ângulos, polígonos e congruência','Lua':'Sistema Sol, Terra e Lua','Energia':'Fontes e transformação de energia'};
export function topicFor(q:Question){const label=q.topicLabel||'';return topicAliases[label]||label}

// Alternativas de questões de múltipla escolha (guardadas como JSON); null para questões abertas.
export function optionsOf(q:Question):string[]|null{
 if(!q.options)return null;
 try{const o=JSON.parse(q.options);return Array.isArray(o)&&o.length>=2&&o.every(x=>typeof x==='string')?o:null}catch{return null}
}
export const LETTERS=['A','B','C','D','E'];
export const LEVELS:Record<number,string>={1:'Fácil',2:'Média',3:'Desafio'};

// Interpreta a resposta falada: “letra B”, “alternativa c”, “bê” ou o texto da alternativa.
const spokenLetters:Record<string,number>={a:0,'á':0,b:1,'bê':1,be:1,c:2,'cê':2,ce:2,se:2,d:3,'dê':3,de:3,e:4,'é':4};
export function matchSpokenOption(said:string,options:string[]):number|null{
 const norm=(x:string)=>x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const raw=said.toLowerCase().trim();
 const m=raw.match(/(?:letra|alternativa|op[cç][aã]o)\s+([a-e]|[áé]|b[eê]|c[eê]|d[eê])\b/)||raw.match(/^([a-e]|b[eê]|c[eê]|d[eê]|se)[.!]?$/);
 if(m){const i=spokenLetters[m[1]];if(i!==undefined&&i<options.length)return i}
 const s=norm(said);if(!s)return null;
 const exact=options.findIndex(o=>norm(o)===s);if(exact>=0)return exact;
 const partial=options.map((o,i)=>({i,o:norm(o)})).filter(x=>x.o.length>2&&(s.includes(x.o)||x.o.includes(s)));
 return partial.length===1?partial[0].i:null;
}

// Videoaulas ligadas ao tema da questão (mesma disciplina e tema do plano).
export function videosFor(resources:Resource[],subject:string|null,topic:string){return resources.filter(r=>r.kind!=='repository'&&r.topic===topic&&(!subject||r.subject===subject))}

export function shuffle<T>(items:T[]):T[]{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

// Última tentativa de cada questão (a API devolve as tentativas da mais nova para a mais antiga).
export function lastAttempts(attempts:Attempt[]){const map=new Map<string,Attempt>();for(const a of attempts)if(!map.has(a.questionId))map.set(a.questionId,a);return map}

// ---------- Elementos visuais ----------
export function Spark(){return <span className="spark" aria-hidden="true"><Sparkle size={18} fill="currentColor" strokeWidth={0}/></span>}

export function Verdict({result}:{result:Result}){
 return <p className={'verdict '+result.verdict}><b>{result.verdict==='correct'?'Correta.':result.verdict==='incorrect'?'Incorreta.':'Revise.'}</b> {result.feedback}</p>;
}

export type OrbState='idle'|'listening'|'thinking'|'speaking';
export function Orb({state='idle',size=150,label}:{state?:OrbState;size?:number;label?:string}){
 return <div className={'orb-wrap '+state} style={{width:size,height:size}} role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true}><div className="orb"/></div>;
}

export function Segmented<T extends string>({options,value,onChange,label}:{options:{value:T;label:string}[];value:T;onChange:(v:T)=>void;label:string}){
 return <div className="segmented" role="radiogroup" aria-label={label}>{options.map(o=><button key={o.value} type="button" role="radio" aria-checked={value===o.value} className={value===o.value?'on':''} onClick={()=>onChange(o.value)}>{o.label}</button>)}</div>;
}

// ---------- Voz no navegador (Web Speech API: sem custo e sem enviar áudio ao servidor) ----------
type Recognition={lang:string;interimResults:boolean;continuous:boolean;start():void;stop():void;abort():void;onresult:((e:{resultIndex:number;results:ArrayLike<ArrayLike<{transcript:string}>&{isFinal:boolean}>})=>void)|null;onerror:((e:{error:string})=>void)|null;onend:(()=>void)|null};
function recognitionClass():(new()=>Recognition)|null{
 if(typeof window==='undefined')return null;
 const w=window as unknown as {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};
 return w.SpeechRecognition||w.webkitSpeechRecognition||null;
}

const noop=()=>()=>{};

export function useVoice(onError:(message:string)=>void){
 const rec=useRef<Recognition|null>(null);
 const [listening,setListening]=useState(false),[speaking,setSpeaking]=useState(false);
 const stop=useCallback(()=>{rec.current?.stop()},[]);
 const listen=useCallback((onText:(text:string)=>void)=>{
  const Rec=recognitionClass();
  if(!Rec){onError('Ditado por voz indisponível neste navegador. Use Chrome, Edge ou Safari.');return}
  if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel();
  rec.current?.abort();
  const r=new Rec();r.lang='pt-BR';r.interimResults=false;r.continuous=false;
  r.onresult=e=>{let said='';for(let i=e.resultIndex;i<e.results.length;i++)said+=e.results[i][0]?.transcript||'';said=said.trim();if(said)onText(said)};
  r.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed')onError('Permissão para o microfone não concedida.');else if(e.error!=='no-speech'&&e.error!=='aborted')onError('Não foi possível reconhecer a fala. Tente de novo.')};
  r.onend=()=>{setListening(false);if(rec.current===r)rec.current=null};
  rec.current=r;r.start();setListening(true);
 },[onError]);
 const speak=useCallback((text:string,onEnd?:()=>void)=>{
  if(typeof speechSynthesis==='undefined'){onError('Leitura em voz alta indisponível neste navegador.');return}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text.slice(0,6000));u.lang='pt-BR';u.rate=1;
  const voices=speechSynthesis.getVoices();
  const voice=voices.find(v=>v.lang.toLowerCase()==='pt-br')||voices.find(v=>v.lang.toLowerCase().startsWith('pt'));
  if(voice)u.voice=voice;
  u.onstart=()=>setSpeaking(true);
  u.onend=()=>{setSpeaking(false);onEnd?.()};
  u.onerror=()=>setSpeaking(false);
  speechSynthesis.speak(u);
 },[onError]);
 const silence=useCallback(()=>{if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel();setSpeaking(false)},[]);
 useEffect(()=>()=>{rec.current?.abort();if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel()},[]);
 // Lido só no cliente, sem divergir da renderização do servidor.
 const supported=useSyncExternalStore(noop,()=>Boolean(recognitionClass()),()=>false);
 return {listening,speaking,listen,stop,speak,silence,supported};
}
