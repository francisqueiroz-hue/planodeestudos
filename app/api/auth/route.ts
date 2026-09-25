import {eq} from 'drizzle-orm';
import {getDb} from '../../../db';
import {users} from '../../../db/schema';
import {clearFailures,createSession,currentUser,destroySession,recordFailure,sessionCookie,tooManyFailures} from '../../../lib/auth';
import {createTrail,ensureBank,ensureCatalog} from '../../../lib/bootstrap';
import {env} from 'cloudflare:workers';
import {hashPassword,normalizeEmail,passwordProblem,randomHex,validEmail,verifyPassword} from '../../../lib/password';

const noStore={'Cache-Control':'no-store'};
function fail(error:string,status=400){return Response.json({error},{status,headers:noStore})}
function withSession(r:Request,body:unknown,token:string|null){return Response.json(body,{headers:{...noStore,'Set-Cookie':sessionCookie(r,token)}})}

// Uso pessoal: depois da primeira conta, o cadastro fica fechado (ALLOW_SIGNUP=true reabre).
async function signupOpen(){
 if(env.ALLOW_SIGNUP==='true')return true;
 const any=await getDb().select({id:users.id}).from(users).limit(1).get();
 return !any;
}

export async function GET(r:Request){
 try{return Response.json({user:await currentUser(r),signupOpen:await signupOpen()},{headers:noStore})}
 catch(e){console.error('auth GET',e);return fail('Serviço de login indisponível.',503)}
}

export async function POST(r:Request){
 let body:Record<string,unknown>;
 try{body=await r.json() as Record<string,unknown>}catch{return fail('Pedido inválido.')}
 const op=String(body.op||'');
 try{
  if(op==='logout'){await destroySession(r);return withSession(r,{ok:true},null)}
  const email=normalizeEmail(body.email),password=String(body.password??'');
  if(!validEmail(email))return fail('Informe um e-mail válido.');
  const db=getDb();
  if(op==='register'){
   if(!await signupOpen())return fail('Esta plataforma é de uso pessoal e o cadastro está fechado. Use “Entrar”.',403);
   const name=String(body.name??'').trim().slice(0,80);
   if(!name)return fail('Informe seu nome.');
   const problem=passwordProblem(password);if(problem)return fail(problem);
   const exists=await db.select({id:users.id}).from(users).where(eq(users.email,email)).get();
   if(exists)return fail('Já existe uma conta com este e-mail. Use “Entrar”.',409);
   const id=crypto.randomUUID(),salt=randomHex(16);
   await db.insert(users).values({id,email,name,passwordHash:await hashPassword(password,salt),passwordSalt:salt,createdAt:Date.now()});
   await ensureCatalog();await ensureBank(id);await createTrail(id,'Matemática');
   return withSession(r,{user:{id,email,name}},await createSession(id));
  }
  if(op==='login'){
   if(await tooManyFailures(email))return fail('Muitas tentativas. Aguarde 15 minutos e tente de novo.',429);
   const u=await db.select().from(users).where(eq(users.email,email)).get();
   // Mesmo sem usuário, calcula um hash para o tempo de resposta não revelar se o e-mail existe.
   const ok=u?await verifyPassword(password,u.passwordSalt,u.passwordHash):(await hashPassword(password,'00'),false);
   if(!u||!ok){await recordFailure(email);return fail('E-mail ou senha incorretos.',401)}
   await clearFailures(email);
   // Instala questões novas do banco para quem já tinha conta.
   await ensureBank(u.id).catch(e=>console.error('seed on login',e));
   return withSession(r,{user:{id:u.id,email:u.email,name:u.name}},await createSession(u.id));
  }
  return fail('Ação inválida.');
 }catch(e){console.error('auth POST',op,e);return fail('Não foi possível concluir. Tente novamente.',503)}
}
