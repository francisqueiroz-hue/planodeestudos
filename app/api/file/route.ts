import {env} from 'cloudflare:workers';
import {getDb} from '../../../db';
import {materials} from '../../../db/schema';
import {aiReady} from '../../../lib/ai';
import {currentUserId} from '../../../lib/auth';
import {MAX_AI_BYTES,readMaterial} from '../../../lib/material-reading';

const KINDS=['PDF','prova antiga','anotações'];
const ACCEPTED=['application/pdf','image/png','image/jpeg','text/plain'];

export async function POST(r:Request){
 const owner=await currentUserId(r);if(!owner)return Response.json({error:'Entre na sua conta.'},{status:401});
 try{
  const form=await r.formData();const file=form.get('file');const kind=String(form.get('kind')||'PDF');
  if(!(file instanceof File)||file.size>15*1024*1024||file.size===0)return Response.json({error:'Escolha um arquivo de até 15 MB.'},{status:400});
  if(!ACCEPTED.includes(file.type))return Response.json({error:'Formato permitido: PDF, PNG, JPG ou TXT.'},{status:400});
  const id=crypto.randomUUID(),key=`${owner}/${id}`,title=file.name.slice(0,160)||'arquivo';
  await env.BUCKET!.put(key,file.stream(),{httpMetadata:{contentType:file.type}});
  try{await getDb().insert(materials).values({id,owner,title,kind:KINDS.includes(kind)?kind:'PDF',content:'',objectKey:key,createdAt:Date.now()})}catch(e){await env.BUCKET!.delete(key);throw e}
  let processed=false,readError='';
  if(aiReady()&&file.size<=MAX_AI_BYTES){try{await readMaterial({id,title,objectKey:key});processed=true}catch(e){console.error('automatic reading failed',e);readError=e instanceof Error?e.message:''}}
  return Response.json({ok:true,processed,readError});
 }catch(e){console.error('file upload',e);return Response.json({error:'Falha ao enviar o arquivo.'},{status:503})}
}
