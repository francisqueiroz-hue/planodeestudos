// Versão web independente do Painel de Estudos (foco em Matemática), publicada como página única.
// Usa os mesmos dados do app: banco de questões, currículo, plano anual, videoaulas e gerador do treino.
import {bankQuestions} from '../lib/bank/index.ts';
import {curriculum} from '../lib/curriculum.ts';
import {bimester,schoolWeek,topicPlans} from '../lib/study-plan.ts';
import {resources} from '../lib/resources.ts';
import {drillTopics,makeDrill,type Drill} from '../lib/math-drill.ts';

type Q={id:string;subject:string;topic:string;difficulty:number;prompt:string;options:string[];answer:string;explanation:string};
type Answer={ok:boolean;n:number;t:number};
type Progress={answers:Record<string,Answer>;done:Record<string,boolean>;drills:Record<string,{best:number;runs:number}>;updated:number};
type Sample=((input:unknown,opts?:{onText?:(x:{text:string})=>void;signal?:AbortSignal;modelTier?:string;cache?:boolean})=>Promise<{text:string;truncated:boolean}>);
type DocRef={get():Promise<{exists:boolean;data():Record<string,unknown>|undefined}>;set(d:Record<string,unknown>):Promise<void>};

const MATH='Matemática';
const LEVEL=['','Fácil','Média','Desafio'];
const L=['A','B','C','D'];
function hash(t:string){let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
const Qs:Q[]=bankQuestions.map(q=>({...q,id:hash(q.subject+'|'+q.prompt)}));
const subjects=Object.keys(curriculum);
const videos=(s:string,t:string)=>resources.filter(r=>r.subject===s&&r.topic===t&&r.kind!=='repository');
const repos=resources.filter(r=>r.kind==='repository');

// ---------- DOM ----------
type Child=Node|string|number|false|null|undefined;
function h<K extends keyof HTMLElementTagNameMap>(tag:K,attrs:Record<string,unknown>={},...kids:Child[]):HTMLElementTagNameMap[K]{
 const el=document.createElement(tag);
 for(const [k,v] of Object.entries(attrs)){
  if(v===false||v==null)continue;
  if(k.startsWith('on')&&typeof v==='function')el.addEventListener(k.slice(2),v as EventListener);
  else if(k==='class')el.className=String(v);
  else if(k==='style')el.setAttribute('style',String(v));
  else el.setAttribute(k,v===true?'':String(v));
 }
 for(const c of kids.flat())if(c!==false&&c!=null)el.append(c instanceof Node?c:document.createTextNode(String(c)));
 return el;
}
const $=(s:string)=>document.querySelector(s) as HTMLElement;
function shuffle<T>(a:T[]){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}

// ---------- Progresso: banco de dados do artifact (privado do usuário) com cópia no navegador ----------
const LS='painel-matematica-progresso';
let P:Progress={answers:{},done:{},drills:{},updated:0};
try{const raw=localStorage.getItem(LS);if(raw)P={...P,...JSON.parse(raw)}}catch{/* sem armazenamento local */}
let docRef:DocRef|null=null,saving=false,dirty=false,saveTimer=0;
let syncState:'local'|'nuvem'|'salvando'|'erro'='local';

function merge(a:Progress,b:Progress):Progress{
 const answers={...a.answers};for(const [k,v] of Object.entries(b.answers||{}))if(!answers[k]||v.t>answers[k].t)answers[k]=v;
 const drills={...a.drills};for(const [k,v] of Object.entries(b.drills||{})){const c=drills[k];drills[k]={best:Math.max(c?.best??0,v.best),runs:Math.max(c?.runs??0,v.runs)}}
 return {answers,done:{...a.done,...b.done},drills,updated:Math.max(a.updated,b.updated)};
}
function persist(){
 P.updated=Date.now();
 try{localStorage.setItem(LS,JSON.stringify(P))}catch{/* ignora */}
 dirty=true;clearTimeout(saveTimer);saveTimer=window.setTimeout(flush,1200);
}
async function flush(){
 if(!docRef||saving||!dirty)return;
 saving=true;dirty=false;setSync('salvando');
 try{await docRef.set(P as unknown as Record<string,unknown>);setSync('nuvem')}catch{setSync('erro');dirty=true}
 finally{saving=false;if(dirty)saveTimer=window.setTimeout(flush,2000)}
}
function setSync(s:typeof syncState){syncState=s;const el=document.getElementById('sync');if(el){el.textContent={local:'Progresso salvo neste navegador',nuvem:'Progresso salvo na sua conta',salvando:'Salvando…',erro:'Não foi possível salvar na conta; salvo neste navegador'}[s];el.dataset.state=s}}

async function connect(){
 const w=window as unknown as {claude?:{use(n:string):Promise<unknown>}};
 if(!w.claude)return;
 const [db,user]=await Promise.all([w.claude.use('db'),w.claude.use('user')]) as [{doc(p:string):DocRef}|null,{id():Promise<string|null>}|null];
 const uid=user?await user.id():null;
 if(!db||!uid)return;
 docRef=db.doc(`data/users/${uid}/progress`);
 try{
  const snap=await docRef.get();
  if(snap.exists){P=merge(snap.data() as unknown as Progress,P);try{localStorage.setItem(LS,JSON.stringify(P))}catch{/* ignora */}}
  setSync('nuvem');dirty=true;flush();render();
 }catch{setSync('erro')}
}

let sample:Sample|null=null;
async function connectSample(){
 const w=window as unknown as {claude?:{use(n:string):Promise<unknown>}};
 if(!w.claude)return;
 sample=await w.claude.use('sample') as Sample|null;
 if(sample)render();
}

// ---------- Estatísticas ----------
function record(q:{id:string},ok:boolean){const prev=P.answers[q.id];P.answers[q.id]={ok,n:(prev?.n??0)+1,t:Date.now()};persist()}
function topicStats(s:string,t:string){
 const qs=Qs.filter(q=>q.subject===s&&q.topic===t),ans=qs.map(q=>P.answers[q.id]).filter(Boolean) as Answer[];
 return {total:qs.length,done:ans.length,ok:ans.filter(a=>a.ok).length};
}
function subjectStats(s:string){const qs=Qs.filter(q=>q.subject===s),ans=qs.map(q=>P.answers[q.id]).filter(Boolean) as Answer[];return {total:qs.length,done:ans.length,ok:ans.filter(a=>a.ok).length}}
const pct=(a:number,b:number)=>b?Math.round(a*100/b):0;

// ---------- Estado da navegação ----------
type View='mat'|'treino'|'simulado'|'revisao'|'plano'|'questoes'|'tutor';
const S={view:'mat' as View,subject:MATH,topic:'',level:0,limit:10,drillTopic:'',drill:null as null|{items:Drill[];i:number;choice:number|null;checked:boolean;score:number},sim:null as null|{items:Q[];i:number;choice:number|null;checked:boolean;results:boolean[]},simSubject:MATH,simTopic:'',simSize:10,chat:[] as {role:'user'|'assistant';content:string}[]};
const tabs:[View,string][]=[['mat','Matemática'],['treino','Treino rápido'],['simulado','Simulado'],['revisao','Revisão'],['plano','Plano'],['questoes','Todas as matérias'],['tutor','Tutor']];
function go(v:View,patch:Partial<typeof S>={}){Object.assign(S,patch,{view:v});render();window.scrollTo({top:0,behavior:'smooth'})}

// ---------- Componentes ----------
function header(){
 const st=subjectStats(MATH);
 return h('header',{class:'top'},
  h('div',{class:'bar'},
   h('div',{class:'brand'},h('span',{class:'mark'},'Σ'),h('div',{},h('b',{},'Painel de Estudos'),h('small',{},'8º ano · foco em Matemática'))),
   h('div',{class:'score'},h('b',{},`${st.done}/${st.total}`),h('small',{},'questões de Matemática feitas'))),
  h('nav',{class:'tabs','aria-label':'Seções'},...tabs.filter(([v])=>v!=='tutor'||sample).map(([v,label])=>h('button',{class:S.view===v?'on':'','aria-current':S.view===v?'page':false,onclick:()=>go(v,v==='questoes'&&S.view!=='questoes'?{subject:MATH,topic:'',limit:10}:{})},label))));
}
function meter(v:number){return h('div',{class:'meter','aria-hidden':'true'},h('div',{style:`width:${v}%`}))}
function videoLinks(s:string,t:string,max=2){const vs=videos(s,t).slice(0,max);return vs.length?h('div',{class:'links'},...vs.map(v=>h('a',{href:v.url,target:'_blank',rel:'noopener noreferrer',title:v.provider},'▶ ',v.title))):null}

function explainButton(q:{prompt:string;options:string[];answer:string;explanation:string}){
 if(!sample)return null;
 const out=h('div',{class:'explain'});
 const btn=h('button',{class:'ghost small',onclick:async()=>{
  btn.disabled=true;out.textContent='Pensando…';
  try{
   await sample!(`Você é um professor de Matemática e demais disciplinas do 8º ano, explicando para um estudante de 13 anos. Explique passo a passo, em português do Brasil, como resolver a questão abaixo e por que a resposta correta é a indicada. Mostre as contas. Use no máximo 12 linhas, texto simples, sem Markdown.\n\nQuestão: ${q.prompt}\nAlternativas: ${q.options.map((o,i)=>`${L[i]}) ${o}`).join('; ')}\nResposta correta: ${q.answer}\nComentário do gabarito: ${q.explanation}`,{onText:({text})=>{out.textContent=text},modelTier:'default'});
  }catch(e){out.textContent=(e as {code?:string}).code==='not_granted'?'Explicação não autorizada nesta visualização.':'Não foi possível gerar a explicação agora. Tente de novo em instantes.'}
  finally{btn.disabled=false}
 }},'Explicar passo a passo com o Claude');
 return h('div',{class:'explain-wrap'},btn,out);
}

function questionCard(q:Q){
 let choice:number|null=null;const prev=P.answers[q.id];
 const card=h('article',{class:'card q'});
 const opts=q.options.map((o,i)=>h('button',{class:'opt',role:'radio','aria-checked':'false',onclick:()=>{if(card.dataset.done)return;choice=i;opts.forEach((b,k)=>{b.classList.toggle('on',k===i);b.setAttribute('aria-checked',String(k===i))});check.disabled=false}},h('span',{class:'l'},L[i]),h('span',{},o)));
 const feedback=h('div',{class:'feedback',hidden:true});
 const check=h('button',{class:'primary small',disabled:true,onclick:()=>{
  if(choice===null)return;const ok=q.options[choice]===q.answer;card.dataset.done='1';record(q,ok);
  opts.forEach((b,k)=>{b.disabled=true;if(q.options[k]===q.answer)b.classList.add('right');else if(k===choice)b.classList.add('wrong')});
  feedback.replaceChildren(h('p',{class:ok?'ok':'bad'},h('b',{},ok?'Correta. ':'Incorreta. '),`Gabarito: ${L[q.options.indexOf(q.answer)]}) ${q.answer}`),h('p',{class:'dim'},q.explanation),explainButton(q)??'',h('button',{class:'ghost small',onclick:()=>card.replaceWith(questionCard(q))},'Tentar de novo'));
  feedback.hidden=false;check.hidden=true;
 }},'Corrigir');
 card.append(
  h('div',{class:'meta'},h('span',{},`${q.subject} · ${q.topic}`),h('span',{class:`lvl l${q.difficulty}`},LEVEL[q.difficulty]),prev?h('span',{class:prev.ok?'tag ok':'tag bad'},prev.ok?'acertou antes':'errou antes'):null),
  h('p',{class:'prompt'},q.prompt),h('div',{class:'opts',role:'radiogroup','aria-label':'Alternativas'},...opts),check,feedback,videoLinks(q.subject,q.topic)??'');
 return card;
}
function questionList(list:Q[],empty:string){
 if(!list.length)return h('p',{class:'empty'},empty);
 const wrap=h('div',{class:'stack'},...list.slice(0,S.limit).map(questionCard));
 if(list.length>S.limit)wrap.append(h('button',{class:'ghost',onclick:()=>{S.limit+=10;render()}},`Mostrar mais ${Math.min(10,list.length-S.limit)} (faltam ${list.length-S.limit})`));
 return wrap;
}

// ---------- Telas ----------
function viewMat(){
 const st=subjectStats(MATH),topics=curriculum[MATH];
 const mastered=topics.filter(t=>{const s=topicStats(MATH,t);return s.done>=5&&pct(s.ok,s.done)>=80}).length;
 return h('main',{},
  h('section',{class:'hero'},h('h1',{},h('span',{class:'dim'},'Matemática'),' em foco, tema por tema.'),h('p',{class:'lead'},`${st.total} questões com gabarito comentado, treino rápido sem fim e o plano do ano em 12 temas.`)),
  h('div',{class:'stats'},
   h('div',{class:'stat'},h('b',{},`${st.done}`),h('span',{},`de ${st.total} questões feitas`)),
   h('div',{class:'stat'},h('b',{},st.done?`${pct(st.ok,st.done)}%`:'—'),h('span',{},'de acertos')),
   h('div',{class:'stat'},h('b',{},`${mastered}/12`),h('span',{},'temas dominados (80%+)')),
   h('div',{class:'stat'},h('b',{},`${Object.values(P.drills).reduce((n,d)=>n+d.runs,0)}`),h('span',{},'rodadas de treino'))),
  h('div',{class:'actions'},
   h('button',{class:'primary',onclick:()=>go('treino',{drillTopic:'',drill:null})},'Treino rápido'),
   h('button',{class:'secondary',onclick:()=>go('simulado',{sim:null,simSubject:MATH,simTopic:''})},'Simulado de Matemática'),
   h('button',{class:'secondary',onclick:()=>go('revisao',{subject:MATH,limit:10})},'Revisar erros')),
  h('div',{class:'grid'},...topics.map((t,i)=>{
   const s=topicStats(MATH,t),w=schoolWeek(i,topics.length),plan=topicPlans[MATH][t],v=videos(MATH,t)[0];
   return h('article',{class:'card topic'},
    h('small',{class:'eyebrow'},`Semana ${w} · ${bimester(w)}º bimestre`),h('h3',{},t),h('p',{class:'dim'},plan.objective),
    meter(pct(s.done,s.total)),h('small',{class:'dim'},`${s.done}/${s.total} feitas${s.done?` · ${pct(s.ok,s.done)}% de acertos`:''}`),
    h('div',{class:'row'},
     h('button',{class:'primary small',onclick:()=>go('questoes',{subject:MATH,topic:t,level:0,limit:10})},'Questões'),
     drillTopics.includes(t)?h('button',{class:'secondary small',onclick:()=>go('treino',{drillTopic:t,drill:null})},'Treino'):null,
     v?h('a',{class:'small-link',href:v.url,target:'_blank',rel:'noopener noreferrer',title:v.title},'▶ Aula'):null));
  })));
}

function viewTreino(){
 const d=S.drill;
 if(!d){
  return h('main',{},h('section',{class:'hero'},h('h1',{},'Treino rápido ',h('span',{class:'dim'},'de Matemática.')),h('p',{class:'lead'},'10 contas novas a cada rodada, com números sorteados. A resposta é calculada pelo próprio programa.')),
   h('div',{class:'card center'},
    h('label',{class:'field-label'},'Tema',h('select',{id:'drill-topic',onchange:(e:Event)=>{S.drillTopic=(e.target as HTMLSelectElement).value}},h('option',{value:''},'Todos os temas'),...drillTopics.map(t=>h('option',{value:t,selected:S.drillTopic===t},t)))),
    h('button',{class:'primary',onclick:()=>{S.drill={items:makeDrill(10,S.drillTopic,Date.now()),i:0,choice:null,checked:false,score:0};render()}},'Começar rodada'),
    (()=>{const b=P.drills[S.drillTopic||'*'];return b?h('p',{class:'dim'},`Melhor resultado: ${b.best}/10 em ${b.runs} rodada${b.runs>1?'s':''}.`):null})()));
 }
 if(d.i>=d.items.length){
  const key=S.drillTopic||'*',best=P.drills[key];
  return h('main',{},h('div',{class:'card center'},h('h2',{},`Você acertou ${d.score} de 10.`),h('p',{class:'dim'},d.score>=8?'Excelente!':d.score>=6?'Bom treino!':'Vale mais uma rodada.'),best?h('p',{class:'dim'},`Melhor resultado neste tema: ${best.best}/10.`):null,
   h('div',{class:'row center'},h('button',{class:'primary',onclick:()=>{S.drill={items:makeDrill(10,S.drillTopic,Date.now()),i:0,choice:null,checked:false,score:0};render()}},'Nova rodada'),h('button',{class:'secondary',onclick:()=>go('mat')},'Voltar aos temas'))));
 }
 const it=d.items[d.i];
 return h('main',{},h('div',{class:'card runner'},
  h('div',{class:'run-top'},h('span',{class:'eyebrow'},`${d.i+1} de 10 · ${it.topic}`),h('span',{class:'eyebrow'},`${d.score} acertos`)),
  h('div',{class:'meter'},h('div',{style:`width:${d.i*10}%`})),
  h('p',{class:'prompt big'},it.prompt),
  h('div',{class:'opts'},...it.options.map((o,k)=>h('button',{class:'opt'+(d.choice===k?' on':'')+(d.checked&&o===it.answer?' right':'')+(d.checked&&k===d.choice&&o!==it.answer?' wrong':''),disabled:d.checked,onclick:()=>{d.choice=k;render()}},h('span',{class:'l'},L[k]),h('span',{},o)))),
  !d.checked?h('button',{class:'primary',disabled:d.choice===null,onclick:()=>{d.checked=true;if(it.options[d.choice!]===it.answer)d.score++;if(d.i===d.items.length-1){const key=S.drillTopic||'*',b=P.drills[key];P.drills[key]={best:Math.max(b?.best??0,d.score),runs:(b?.runs??0)+1};persist()}render()}},'Conferir')
  :h('div',{class:'feedback'},h('p',{class:it.options[d.choice!]===it.answer?'ok':'bad'},h('b',{},it.options[d.choice!]===it.answer?'Correta. ':'Incorreta. '),`Resposta: ${it.answer}`),h('p',{class:'dim'},it.explanation),explainButton(it)??'',h('button',{class:'primary',onclick:()=>{d.i++;d.choice=null;d.checked=false;render()}},d.i+1<d.items.length?'Próxima':'Ver resultado'))));
}

function viewSimulado(){
 const sim=S.sim;
 if(!sim){
  const pool=Qs.filter(q=>q.subject===S.simSubject&&(!S.simTopic||q.topic===S.simTopic));
  return h('main',{},h('section',{class:'hero'},h('h1',{},'Simulado ',h('span',{class:'dim'},'como se fosse a prova.')),h('p',{class:'lead'},'Uma questão por vez, com nota no final e revisão das que você errou.')),
   h('div',{class:'card center'},
    h('div',{class:'row center'},
     h('label',{class:'field-label'},'Disciplina',h('select',{id:'sim-subject',onchange:(e:Event)=>{S.simSubject=(e.target as HTMLSelectElement).value;S.simTopic='';render()}},...subjects.map(s=>h('option',{value:s,selected:S.simSubject===s},s)))),
     h('label',{class:'field-label'},'Tema',h('select',{id:'sim-topic',onchange:(e:Event)=>{S.simTopic=(e.target as HTMLSelectElement).value;render()}},h('option',{value:''},'Todos os temas'),...curriculum[S.simSubject].map(t=>h('option',{value:t,selected:S.simTopic===t},t)))),
     h('label',{class:'field-label'},'Questões',h('select',{id:'sim-size',onchange:(e:Event)=>{S.simSize=Number((e.target as HTMLSelectElement).value)}},...[5,10,15,20].map(n=>h('option',{value:n,selected:S.simSize===n},String(n)))))),
    h('button',{class:'primary',disabled:!pool.length,onclick:()=>{S.sim={items:shuffle(pool).slice(0,S.simSize),i:0,choice:null,checked:false,results:[]};render()}},'Começar simulado'),
    h('p',{class:'dim'},`${pool.length} questões disponíveis nesta seleção.`)));
 }
 if(sim.i>=sim.items.length){
  const ok=sim.results.filter(Boolean).length,n=sim.items.length;
  return h('main',{},h('div',{class:'card center'},h('h2',{},`Nota: ${Math.round(ok*100/n)/10} (${ok} de ${n})`),h('p',{class:'dim'},ok/n>=0.7?'Mandou bem!':ok/n>=0.5?'Está no caminho.':'Revise os temas abaixo e tente de novo.'),
   h('ol',{class:'results'},...sim.items.map((q,k)=>h('li',{class:sim.results[k]?'ok':'bad'},h('b',{},q.prompt),h('span',{},`Gabarito: ${q.answer}`)))),
   h('div',{class:'row center'},h('button',{class:'primary',onclick:()=>{S.sim=null;render()}},'Novo simulado'),h('button',{class:'secondary',onclick:()=>go('revisao',{subject:S.simSubject,limit:10})},'Revisar erros'))));
 }
 const q=sim.items[sim.i];
 return h('main',{},h('div',{class:'card runner'},
  h('div',{class:'run-top'},h('span',{class:'eyebrow'},`Questão ${sim.i+1} de ${sim.items.length}`),h('span',{class:'eyebrow'},q.topic)),
  h('div',{class:'meter'},h('div',{style:`width:${sim.i*100/sim.items.length}%`})),
  h('p',{class:'prompt big'},q.prompt),
  h('div',{class:'opts'},...q.options.map((o,k)=>h('button',{class:'opt'+(sim.choice===k?' on':'')+(sim.checked&&o===q.answer?' right':'')+(sim.checked&&k===sim.choice&&o!==q.answer?' wrong':''),disabled:sim.checked,onclick:()=>{sim.choice=k;render()}},h('span',{class:'l'},L[k]),h('span',{},o)))),
  !sim.checked?h('button',{class:'primary',disabled:sim.choice===null,onclick:()=>{sim.checked=true;const ok=q.options[sim.choice!]===q.answer;sim.results.push(ok);record(q,ok);render()}},'Confirmar resposta')
  :h('div',{class:'feedback'},h('p',{class:sim.results[sim.i]?'ok':'bad'},h('b',{},sim.results[sim.i]?'Correta. ':'Incorreta. '),`Gabarito: ${q.answer}`),h('p',{class:'dim'},q.explanation),h('button',{class:'primary',onclick:()=>{sim.i++;sim.choice=null;sim.checked=false;render()}},sim.i+1<sim.items.length?'Próxima':'Ver nota'))));
}

function subjectFilter(withLevel=true){
 return h('div',{class:'row filters'},
  h('select',{id:'f-subject','aria-label':'Disciplina',onchange:(e:Event)=>{S.subject=(e.target as HTMLSelectElement).value;S.topic='';S.limit=10;render()}},...subjects.map(s=>h('option',{value:s,selected:S.subject===s},s))),
  h('select',{id:'f-topic','aria-label':'Tema',onchange:(e:Event)=>{S.topic=(e.target as HTMLSelectElement).value;S.limit=10;render()}},h('option',{value:''},'Todos os temas'),...curriculum[S.subject].map(t=>h('option',{value:t,selected:S.topic===t},t))),
  withLevel?h('select',{id:'f-level','aria-label':'Nível',onchange:(e:Event)=>{S.level=Number((e.target as HTMLSelectElement).value);S.limit=10;render()}},h('option',{value:0},'Todos os níveis'),...[1,2,3].map(n=>h('option',{value:n,selected:S.level===n},LEVEL[n]))):null);
}
function viewQuestoes(){
 const list=Qs.filter(q=>q.subject===S.subject&&(!S.topic||q.topic===S.topic)&&(!S.level||q.difficulty===S.level));
 return h('main',{},h('section',{class:'hero'},h('h1',{},h('span',{class:'dim'},'Questões'),` de ${S.subject}.`),h('p',{class:'lead'},`${list.length} questões nesta seleção.`)),
  subjectFilter(),S.topic?videoLinks(S.subject,S.topic,3)??'':'',questionList(list,'Nenhuma questão para este filtro.'));
}
function viewRevisao(){
 const list=Qs.filter(q=>q.subject===S.subject&&(!S.topic||q.topic===S.topic)&&P.answers[q.id]&&!P.answers[q.id].ok);
 return h('main',{},h('section',{class:'hero'},h('h1',{},h('span',{class:'dim'},'Revisão:'),' errar faz parte, repetir fixa.'),h('p',{class:'lead'},'Aqui ficam as questões cuja última resposta estava errada. Acertou, sai da lista.')),
  subjectFilter(false),questionList(list,'Nada para revisar nesta disciplina. Quando errar uma questão, ela aparece aqui.'));
}
function viewPlano(){
 const block=(s:string)=>{
  const ts=curriculum[s];
  return h('section',{class:'card plan'},h('h2',{},s),
   h('div',{class:'bims'},...[1,2,3,4].map(b=>h('div',{class:'bim'},h('h3',{},`${b}º bimestre`),...ts.map((t,i)=>({t,i,w:schoolWeek(i,ts.length)})).filter(x=>bimester(x.w)===b).map(({t,w})=>{
    const key=s+'|'+t,st=topicStats(s,t),plan=topicPlans[s][t];
    return h('div',{class:'ptopic'+(P.done[key]?' done':'')},
     h('label',{},h('input',{type:'checkbox',checked:!!P.done[key],onchange:(e:Event)=>{P.done[key]=(e.target as HTMLInputElement).checked;persist();render()}}),h('span',{},h('b',{},t),h('small',{class:'dim'},` · semana ${w}`))),
     h('details',{},h('summary',{},'Objetivo, conceitos e aulas'),h('p',{},plan.objective),h('p',{class:'dim'},'Conceitos: '+plan.concepts.join('; ')+'.'),videoLinks(s,t,2)??''),
     h('div',{class:'row'},h('button',{class:'ghost small',onclick:()=>go('questoes',{subject:s,topic:t,level:0,limit:10})},`Praticar ${st.total} questões`),st.done?h('small',{class:'dim'},`${st.done} feitas · ${pct(st.ok,st.done)}%`):null));
   })))));
 };
 return h('main',{},h('section',{class:'hero'},h('h1',{},'Plano do ano ',h('span',{class:'dim'},'em 4 bimestres.')),h('p',{class:'lead'},'Marque os temas concluídos. Matemática vem primeiro; as outras disciplinas ficam abaixo.')),
  block(MATH),
  h('details',{class:'card others'},h('summary',{},'Outras disciplinas'),...subjects.filter(s=>s!==MATH).map(block)),
  h('section',{class:'card'},h('h2',{},'Acervos oficiais'),h('p',{class:'dim'},'Provas e bancos públicos ficam nos sites de origem, com os direitos de seus autores.'),h('div',{class:'links'},...repos.map(r=>h('a',{href:r.url,target:'_blank',rel:'noopener noreferrer'},`${r.subject} · ${r.title} (${r.provider})`)))));
}
function viewTutor(){
 const log=h('div',{class:'chat'},...S.chat.map(m=>h('div',{class:'bubble '+m.role},m.content)));
 const input=h('textarea',{id:'tutor-input',rows:'3',placeholder:'Ex.: como descubro a fração geratriz de 0,4545...?','aria-label':'Pergunta ao tutor'}) as HTMLTextAreaElement;
 const status=h('p',{class:'dim'});
 const send=h('button',{class:'primary',onclick:async()=>{
  const text=input.value.trim();if(!text||!sample)return;
  S.chat.push({role:'user',content:text});input.value='';
  const answer=h('div',{class:'bubble assistant'},'Pensando…');log.append(h('div',{class:'bubble user'},text),answer);send.disabled=true;
  // Últimas mensagens, começando sempre por uma do estudante; a instrução vai na primeira.
  let recent=S.chat.slice(-8);while(recent.length&&recent[0].role!=='user')recent=recent.slice(1);
  const intro='Você é um tutor paciente para um estudante do 8º ano no Brasil, com foco em Matemática. Explique passo a passo, com contas e exemplos, em português, texto simples sem Markdown, no máximo 15 linhas. Faça uma pergunta de verificação no final.\n\n';
  const turns=recent.map((m,i)=>({role:m.role,content:i===0?intro+m.content:m.content}));
  try{const {text:reply}=await sample(turns,{onText:({text:t})=>{answer.textContent=t},cache:false});S.chat.push({role:'assistant',content:reply});status.textContent=''}
  catch(e){answer.textContent='Não consegui responder agora.';status.textContent=(e as {code?:string}).code==='not_granted'?'O tutor precisa da sua autorização para usar o Claude.':'Tente de novo em instantes.';S.chat.pop()}
  finally{send.disabled=false}
 }},'Perguntar');
 return h('main',{},h('section',{class:'hero'},h('h1',{},h('span',{class:'dim'},'Tutor:'),' pergunte na hora em que travar.'),h('p',{class:'lead'},'Usa o Claude da sua própria conta. As respostas podem conter erros; confira o que for importante.')),
  h('div',{class:'card'},log,input,h('div',{class:'row'},send,S.chat.length?h('button',{class:'ghost small',onclick:()=>{S.chat=[];render()}},'Limpar conversa'):null),status));
}

// ---------- Renderização ----------
function render(){
 const app=$('#app');
 const views:Record<View,()=>HTMLElement>={mat:viewMat,treino:viewTreino,simulado:viewSimulado,revisao:viewRevisao,plano:viewPlano,questoes:viewQuestoes,tutor:viewTutor};
 if(S.view==='tutor'&&!sample)S.view='mat';
 app.replaceChildren(header(),views[S.view](),h('footer',{},h('span',{id:'sync','data-state':syncState}),h('span',{},' · Questões autorais; vídeos e acervos são links externos.')));
 setSync(syncState);
}
render();
connect();
connectSample();
