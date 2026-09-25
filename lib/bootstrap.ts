import {and,eq} from 'drizzle-orm';
import {getDb} from '../db';
import {questions,resourceCatalog} from '../db/schema';
import {starterQuestions} from './question-bank';
import {resources} from './resources';

export const STARTER_SOURCE='Banco inicial 8º ano';

// D1 aceita no máximo 100 parâmetros por instrução: insira linhas em lotes.
export function chunks<T>(items:readonly T[],size:number):T[][]{const out:T[][]=[];for(let i=0;i<items.length;i+=size)out.push(items.slice(i,i+size));return out}

// Garante o catálogo público de links (idempotente).
export async function ensureCatalog(){const db=getDb();for(const part of chunks(resources,9))await db.insert(resourceCatalog).values(part).onConflictDoNothing()}

// Instala para o estudante as questões autorais que ele ainda não tem.
export async function seedQuestions(owner:string){
 const db=getDb();
 const existing=await db.select({prompt:questions.prompt}).from(questions).where(and(eq(questions.owner,owner),eq(questions.source,STARTER_SOURCE)));
 const known=new Set(existing.map(x=>x.prompt));
 const now=Date.now();
 const entries=starterQuestions.filter(([, ,prompt])=>!known.has(prompt)).map(([subject,topic,prompt,answer,explanation],i)=>({id:crypto.randomUUID(),owner,topicId:null,topicLabel:topic,prompt,answer,explanation,subject,source:STARTER_SOURCE,createdAt:now-i}));
 for(const part of chunks(entries,9))await db.insert(questions).values(part);
 return entries.length;
}
