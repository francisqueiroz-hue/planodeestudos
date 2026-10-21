import {env} from 'cloudflare:workers';
import {getDb} from '../../../../db';
import {materials} from '../../../../db/schema';
import {and,eq} from 'drizzle-orm';
import {currentUserId} from '../../../../lib/auth';

export async function GET(r:Request,{params}:{params:Promise<{id:string}>}){
 const owner=await currentUserId(r);if(!owner)return new Response('Acesso negado',{status:401});
 const {id}=await params;
 const row=await getDb().select().from(materials).where(and(eq(materials.id,id),eq(materials.owner,owner))).get();
 if(!row?.objectKey)return new Response('Arquivo não encontrado',{status:404});
 const object=await env.BUCKET!.get(row.objectKey);if(!object)return new Response('Arquivo não encontrado',{status:404});
 return new Response(object.body,{headers:{'Content-Type':object.httpMetadata?.contentType||'application/octet-stream','Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(row.title)}`,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store'}});
}
