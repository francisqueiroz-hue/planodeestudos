import {env} from 'cloudflare:workers';
import {getDb} from '../db';
import {materials} from '../db/schema';
import {eq} from 'drizzle-orm';
import {respond,toBase64} from './ai';
export async function readMaterial(m:{id:string;title:string;objectKey:string|null}){
 if(!m.objectKey)throw Error('Arquivo ausente');
 const object=await env.BUCKET!.get(m.objectKey);if(!object)throw Error('Arquivo ausente');
 if(object.size>8*1024*1024)throw Error('Para leitura por IA, o limite é 8 MB.');
 const mime=object.httpMetadata?.contentType||'application/octet-stream';const bytes=new Uint8Array(await object.arrayBuffer());let part:any;
 if(mime==='application/pdf')part={type:'input_file',filename:m.title,file_data:`data:application/pdf;base64,${toBase64(bytes)}`,detail:'low'};
 else if(mime.startsWith('image/'))part={type:'input_image',image_url:`data:${mime};base64,${toBase64(bytes)}`,detail:'high'};
 else if(mime==='text/plain')part={type:'input_text',text:new TextDecoder().decode(bytes).slice(0,45000)};
 else throw Error('Formato não suportado');
 const result=await respond('Extraia em português o texto e os conceitos pedagógicos deste material para um estudante do 8º ano. Organize por tópicos. Se houver trechos ilegíveis, informe. Não invente conteúdo ausente. Limite a 20 mil caracteres.',[{type:'input_text',text:'Leia o material de estudo a seguir.'},part],6000);
 if(!result)throw Error('Leitura vazia');const content=result.slice(0,20000);
 await getDb().update(materials).set({content,processingStatus:'ready'}).where(eq(materials.id,m.id));return content;
}
