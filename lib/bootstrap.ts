import {and,eq,inArray,sql} from 'drizzle-orm';
import {getDb} from '../db';
import {plans,questions,resourceCatalog,topics,users} from '../db/schema';
import {curriculum} from './curriculum';
import {schoolWeek} from './study-plan.ts';
import {starterQuestions} from './question-bank';
import {BANK_SOURCE,bankQuestions} from './bank/index.ts';
import {resources} from './resources';

export const STARTER_SOURCE='Banco inicial 8º ano';

// D1 aceita no máximo 100 parâmetros por instrução: insira linhas em lotes.
export function chunks<T>(items:readonly T[],size:number):T[][]{const out:T[][]=[];for(let i=0;i<items.length;i+=size)out.push(items.slice(i,i+size));return out}

const fingerprint=(r:{id:string;topic:string;title:string;url:string})=>`${r.id}|${r.topic}|${r.title}|${r.url}`;

// O catálogo no banco difere da lista do código (item novo, removido ou alterado)?
export async function catalogOutdated(){
 const rows=await getDb().select({id:resourceCatalog.id,topic:resourceCatalog.topic,title:resourceCatalog.title,url:resourceCatalog.url}).from(resourceCatalog);
 const stored=new Set(rows.map(fingerprint));
 return rows.length!==resources.length||resources.some(r=>!stored.has(fingerprint(r)));
}

// Sincroniza o catálogo público de links: atualiza os existentes e remove os que saíram da lista.
export async function ensureCatalog(){
 const db=getDb();
 const set={subject:sql`excluded.subject`,topic:sql`excluded.topic`,title:sql`excluded.title`,provider:sql`excluded.provider`,kind:sql`excluded.kind`,url:sql`excluded.url`,sourceUrl:sql`excluded.source_url`,usageNote:sql`excluded.usage_note`,verifiedAt:sql`excluded.verified_at`};
 for(const part of chunks(resources,9))await db.insert(resourceCatalog).values(part).onConflictDoUpdate({target:resourceCatalog.id,set});
 const keep=new Set(resources.map(r=>r.id));
 const stale=(await db.select({id:resourceCatalog.id}).from(resourceCatalog)).map(r=>r.id).filter(id=>!keep.has(id));
 for(const ids of chunks(stale,90))await db.delete(resourceCatalog).where(inArray(resourceCatalog.id,ids));
}

// Instala para o estudante as questões dos bancos (discursivas e de múltipla escolha) que ele ainda não tem.
export async function seedQuestions(owner:string){
 const db=getDb();
 const existing=await db.select({prompt:questions.prompt}).from(questions).where(and(eq(questions.owner,owner),inArray(questions.source,[STARTER_SOURCE,BANK_SOURCE])));
 const known=new Set(existing.map(x=>x.prompt));
 const now=Date.now();
 const open=starterQuestions.filter(([, ,prompt])=>!known.has(prompt)).map(([subject,topic,prompt,answer,explanation])=>({subject,topicLabel:topic,prompt,answer,explanation,source:STARTER_SOURCE,options:null,difficulty:null}));
 const mcq=bankQuestions.filter(q=>!known.has(q.prompt)).map(q=>({subject:q.subject,topicLabel:q.topic,prompt:q.prompt,answer:q.answer,explanation:q.explanation,source:BANK_SOURCE,options:JSON.stringify(q.options),difficulty:q.difficulty}));
 // createdAt decrescente preserva a ordem do banco na listagem (mais recentes primeiro).
 const entries=[...mcq,...open].map((q,i)=>({...q,id:crypto.randomUUID(),owner,topicId:null,createdAt:now-i}));
 for(const part of chunks(entries,8))await db.insert(questions).values(part);
 return entries.length;
}

// Versão do banco de questões: aumente ao incluir questões novas, para instalá-las nas contas existentes
// (sem reinstalar as que o estudante excluiu dentro da mesma versão).
export const BANK_VERSION=2;

export async function ensureBank(owner:string){
 const db=getDb();
 const row=await db.select({v:users.bankVersion}).from(users).where(eq(users.id,owner)).get();
 if((row?.v??0)>=BANK_VERSION)return 0;
 const added=await seedQuestions(owner);
 await db.update(users).set({bankVersion:BANK_VERSION}).where(eq(users.id,owner));
 return added;
}

// Cria a trilha anual de uma disciplina (40 semanas, 4 bimestres), se ainda não existir.
export async function createTrail(owner:string,subject:string){
 const list=curriculum[subject];if(!list)return null;
 const db=getDb(),title=`Trilha de ${subject} · 8º ano`;
 const previous=await db.select({id:plans.id}).from(plans).where(and(eq(plans.owner,owner),eq(plans.title,title))).get();
 if(previous)return {planId:previous.id,count:list.length,existed:true};
 const planId=crypto.randomUUID();
 await db.insert(plans).values({id:planId,owner,title,examDate:null,target:'Plano anual: 4 bimestres, com aulas e questões por tema',createdAt:Date.now()});
 const rows=list.map((t,position)=>({id:crypto.randomUUID(),planId,title:t,position,week:schoolWeek(position,list.length)}));
 for(const part of chunks(rows,15))await db.insert(topics).values(part);
 return {planId,count:list.length,existed:false};
}
