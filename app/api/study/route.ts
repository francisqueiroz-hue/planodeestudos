import {env} from 'cloudflare:workers';
import {getDb} from '../../../db';
import {materials,plans,topics,questions,attempts,resourceCatalog} from '../../../db/schema';
import {eq,and,desc,inArray} from 'drizzle-orm';
import {resources} from '../../../lib/resources';
import {currentUserId} from '../../../lib/auth';
import {catalogOutdated,chunks,createTrail,ensureBank,ensureCatalog,seedQuestions} from '../../../lib/bootstrap';
import {normalizeAnswer} from '../../../lib/password';
import {weekFor} from '../../../lib/planning';

function fail(message:string,status=400){return Response.json({error:message},{status})}

export async function GET(r:Request){
 const owner=await currentUserId(r);if(!owner)return fail('Entre na sua conta para usar o painel.',401);
 try{
  const db=getDb();
  // Instala questões novas do banco (por exemplo, após uma atualização do app).
  await ensureBank(owner);
  const [m,p,q,a]=await Promise.all([
   db.select().from(materials).where(eq(materials.owner,owner)).orderBy(desc(materials.createdAt)),
   db.select().from(plans).where(eq(plans.owner,owner)).orderBy(desc(plans.createdAt)),
   db.select().from(questions).where(eq(questions.owner,owner)).orderBy(desc(questions.createdAt)),
   db.select().from(attempts).where(eq(attempts.owner,owner)).orderBy(desc(attempts.createdAt)),
  ]);
  const t=(await Promise.all(chunks(p.map(v=>v.id),90).map(ids=>db.select().from(topics).where(inArray(topics.planId,ids))))).flat().sort((x,y)=>x.position-y.position);
  if(await catalogOutdated())await ensureCatalog();
  const links=await db.select().from(resourceCatalog);
  return Response.json({materials:m,plans:p,topics:t,questions:q,attempts:a,resources:links.length?links:resources});
 }catch(e){console.error('study GET',e);return fail('Os dados estão temporariamente indisponíveis.',503)}
}

export async function POST(r:Request){
 const owner=await currentUserId(r);if(!owner)return fail('Entre na sua conta para salvar.',401);
 let body:Record<string,unknown>;try{body=await r.json() as Record<string,unknown>}catch{return fail('Pedido inválido.')}
 const op=String(body.op||'');
 try{
  const db=getDb();const id=crypto.randomUUID();const now=Date.now();const str=(v:unknown,max=10000)=>String(v??'').trim().slice(0,max);
  if(op==='material'){const title=str(body.title,160),kind=str(body.kind,30),content=str(body.content,100000);if(!title||!['anotações','prova antiga','vídeo','link'].includes(kind))return fail('Informe título e tipo válidos.');const [row]=await db.insert(materials).values({id,owner,title,kind,content,objectKey:null,processingStatus:'ready',createdAt:now}).returning();return Response.json({item:row})}
  if(op==='plan'){
   const title=str(body.title,160);if(!title)return fail('Informe o nome da prova.');
   const subjects=str(body.subjects,5000).split('\n').map(x=>x.trim().slice(0,160)).filter(Boolean).slice(0,50);if(!subjects.length)return fail('Informe ao menos um tema.');
   const date=str(body.examDate,10);const examDate=/^\d{4}-\d{2}-\d{2}$/.test(date)?date:null;
   const [row]=await db.insert(plans).values({id,owner,title,examDate,target:str(body.target,80)||null,createdAt:now}).returning();
   const rows=subjects.map((title,position)=>({id:crypto.randomUUID(),planId:id,title,position,week:weekFor(position,subjects.length,examDate,now)}));
   for(const part of chunks(rows,15))await db.insert(topics).values(part);
   return Response.json({item:row});
  }
  if(op==='topic'){const topicId=str(body.id,80);const status=str(body.status,20);if(!['pending','done'].includes(status))return fail('Estado inválido.');const record=await db.select({id:topics.id}).from(topics).innerJoin(plans,eq(topics.planId,plans.id)).where(and(eq(topics.id,topicId),eq(plans.owner,owner))).get();if(!record)return fail('Tema não encontrado.',404);await db.update(topics).set({status}).where(eq(topics.id,topicId));return Response.json({ok:true})}
  if(op==='catalog'){await ensureCatalog();return Response.json({count:resources.length})}
  if(op==='path'){
   const subject=str(body.subject,80);
   const res=await createTrail(owner,subject);if(!res)return fail('Disciplina inválida.');
   return Response.json({planId:res.planId,count:res.count,...(res.existed?{notice:'Esta trilha já existe no seu plano.'}:{})});
  }
  if(op==='seed'){const count=await seedQuestions(owner);return Response.json({count,notice:count?'Banco atualizado.':'O banco inicial já está instalado.'})}
  if(op==='question'){const prompt=str(body.prompt,3000),answer=str(body.answer,3000);if(!prompt||!answer)return fail('Informe a pergunta e a resposta.');const [row]=await db.insert(questions).values({id,owner,prompt,answer,topicId:null,topicLabel:str(body.topic,160)||null,subject:str(body.subject,80)||null,source:'Criada por você',createdAt:now}).returning();return Response.json({item:row})}
  if(op==='attempt'){
   const questionId=str(body.questionId,80),response=str(body.response,3000);
   const question=await db.select().from(questions).where(and(eq(questions.id,questionId),eq(questions.owner,owner))).get();if(!question)return fail('Questão não encontrada.',404);
   if(!response)return fail('Escreva sua resposta.');
   // Múltipla escolha: a resposta precisa ser exatamente a alternativa correta.
   const correct=question.options?response.trim()===question.answer.trim():normalizeAnswer(response)===normalizeAnswer(question.answer);
   await db.insert(attempts).values({id,owner,questionId,response,correct,gradingMethod:'exact',createdAt:now});
   return Response.json({verdict:correct?'correct':'review',feedback:correct?'Corresponde ao gabarito.':'Texto diferente do gabarito: compare e veja se o sentido é o mesmo.',answer:question.answer,explanation:question.explanation});
  }
  if(op==='delete'){
   const table=str(body.table,30),target=str(body.id,80);
   if(table==='material'){const row=await db.select().from(materials).where(and(eq(materials.id,target),eq(materials.owner,owner))).get();if(row){await db.delete(materials).where(eq(materials.id,target));if(row.objectKey)await env.BUCKET!.delete(row.objectKey)}}
   else if(table==='question'){const row=await db.select().from(questions).where(and(eq(questions.id,target),eq(questions.owner,owner))).get();if(row){await db.delete(attempts).where(eq(attempts.questionId,target));await db.delete(questions).where(eq(questions.id,target))}}
   else if(table==='plan'){const p=await db.select().from(plans).where(and(eq(plans.id,target),eq(plans.owner,owner))).get();if(p){await db.delete(topics).where(eq(topics.planId,target));await db.delete(plans).where(eq(plans.id,target))}}
   else return fail('Tipo inválido.');
   return Response.json({ok:true});
  }
  return fail('Ação não reconhecida.');
 }catch(e){console.error('study POST',op,e);return fail('Não foi possível salvar. Tente novamente.',503)}
}
