import {env} from 'cloudflare:workers';
export function aiReady(){return Boolean(env.OPENAI_API_KEY)}
function key(){const k=env.OPENAI_API_KEY;if(!k)throw new Error('A integração de IA aguarda a configuração da chave da API.');return k}
export async function openai(path:string,body:BodyInit,contentType='application/json'){
 const res=await fetch('https://api.openai.com/v1/'+path,{method:'POST',headers:{Authorization:'Bearer '+key(),...(contentType?{'Content-Type':contentType}:{})},body,signal:AbortSignal.timeout(55000)});
 if(!res.ok){const detail=await res.text();console.error('AI request failed',res.status,detail.slice(0,400));throw new Error('A IA está indisponível no momento ('+res.status+').')}
 return res;
}
export function outputText(result:any){return (result.output||[]).flatMap((v:any)=>v.content||[]).filter((c:any)=>c.type==='output_text').map((c:any)=>c.text).join('\n')||result.output_text||''}
export async function respond(instructions:string,content:any[],maxOutput=1200){const r=await openai('responses',JSON.stringify({model:'gpt-4.1-mini',instructions,input:[{role:'user',content}],max_output_tokens:maxOutput,store:false}));return outputText(await r.json())}
export function toBase64(bytes:Uint8Array){let result='';for(let i=0;i<bytes.length;i+=8192)result+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(result)}
export function parseJSON<T>(text:string):T{const cleaned=text.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');return JSON.parse(cleaned) as T}
export const tutorRules='Você é tutor pedagógico para estudantes do 8º ano do ensino fundamental brasileiro. Responda em português claro, com explicação passo a passo, perguntas de verificação e exemplos adequados à idade. Não faça o dever pelo estudante sem explicação. Use o material fornecido quando houver; se não souber, diga. Não invente referências nem códigos BNCC. Não peça dados pessoais.';
export async function respondJSON<T>(name:string,instructions:string,content:any[],schema:object,maxOutput=1500):Promise<T>{
 const r=await openai('responses',JSON.stringify({model:'gpt-4.1-mini',instructions,input:[{role:'user',content}],text:{format:{type:'json_schema',name,strict:true,schema}},max_output_tokens:maxOutput,store:false}));
 return parseJSON<T>(outputText(await r.json()));
}
