import {env} from 'cloudflare:workers';
import Anthropic from '@anthropic-ai/sdk';

// Modelo padrão; pode ser trocado sem alterar código com a variável ANTHROPIC_MODEL.
export const DEFAULT_MODEL='claude-opus-5';

export function aiReady(){return Boolean(env.ANTHROPIC_API_KEY)}

function client(){
 const apiKey=env.ANTHROPIC_API_KEY;
 if(!apiKey)throw new Error('A integração de IA aguarda a configuração da chave da API.');
 // ANTHROPIC_BASE_URL (opcional) permite passar pelo Cloudflare AI Gateway para registro e limites de gasto.
 return new Anthropic({apiKey,baseURL:env.ANTHROPIC_BASE_URL||undefined,timeout:120_000,maxRetries:2});
}

export type Part=Anthropic.Beta.BetaContentBlockParam;
type Effort='low'|'medium'|'high';

export class AIError extends Error{}

async function call(system:string,content:Part[],opts:{maxTokens?:number;effort?:Effort;schema?:Record<string,unknown>}={}){
 try{
  const res=await client().beta.messages.create({
   model:env.ANTHROPIC_MODEL||DEFAULT_MODEL,
   max_tokens:opts.maxTokens??16000,
   system,
   messages:[{role:'user',content}],
   output_config:{...(opts.effort?{effort:opts.effort}:{}),...(opts.schema?{format:{type:'json_schema',schema:opts.schema}}:{})},
   // Se o modelo recusar por política de segurança, a API tenta um modelo alternativo.
   betas:['server-side-fallback-2026-07-01'],
   fallbacks:'default',
  });
  if(res.stop_reason==='refusal')throw new AIError('A IA não pôde responder a este pedido. Reformule a pergunta.');
  if(res.stop_reason==='max_tokens')throw new AIError('A resposta ficou longa demais. Tente um pedido mais curto.');
  const text=res.content.flatMap(b=>b.type==='text'?[b.text]:[]).join('\n').trim();
  if(!text)throw new AIError('A IA retornou uma resposta vazia.');
  return text;
 }catch(e){
  if(e instanceof AIError)throw e;
  if(e instanceof Anthropic.AuthenticationError){console.error('AI auth',e.message);throw new AIError('Chave da API inválida. Avise o administrador.')}
  if(e instanceof Anthropic.RateLimitError)throw new AIError('Muitos pedidos à IA agora. Aguarde um minuto e tente de novo.');
  if(e instanceof Anthropic.BadRequestError){console.error('AI bad request',e.message);throw new AIError('A IA não aceitou este conteúdo (arquivo grande ou ilegível?).')}
  if(e instanceof Anthropic.APIError){console.error('AI error',e.status,e.message);throw new AIError('A IA está indisponível no momento.')}
  console.error('AI failure',e);throw new AIError('A IA está indisponível no momento.');
 }
}

export function respond(system:string,content:Part[],effort:Effort='medium'){return call(system,content,{effort})}

export async function respondJSON<T>(system:string,content:Part[],schema:Record<string,unknown>,effort:Effort='high'):Promise<T>{
 const text=await call(system,content,{schema,effort});
 try{return JSON.parse(text) as T}catch{throw new AIError('A IA retornou um formato inesperado. Tente novamente.')}
}

export function toBase64(bytes:Uint8Array){let result='';for(let i=0;i<bytes.length;i+=8192)result+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(result)}

export const tutorRules='Você é tutor pedagógico para estudantes do 8º ano do ensino fundamental brasileiro. Responda em português claro, com explicação passo a passo, perguntas de verificação e exemplos adequados à idade. Não faça o dever pelo estudante sem explicação. Use o material fornecido quando houver; se não souber, diga. Não invente referências nem códigos BNCC. Não peça dados pessoais. Escreva em texto simples, sem tabelas nem Markdown pesado, pois a resposta é exibida como texto e pode ser lida em voz alta.';
