import {and,eq,gt,lt} from 'drizzle-orm';
import {getDb} from '../db';
import {authSessions,loginFailures,users} from '../db/schema';
import {sha256Hex,randomHex} from './password';

export const SESSION_COOKIE='pe_session';
const SESSION_DAYS=30;
export const SESSION_MAX_AGE=SESSION_DAYS*24*60*60;

export type CurrentUser={id:string;email:string;name:string};

function readCookie(r:Request,name:string){
 for(const part of (r.headers.get('cookie')||'').split(';')){const i=part.indexOf('=');if(i>0&&part.slice(0,i).trim()===name)return part.slice(i+1).trim()}
 return null;
}

// O cookie guarda um token aleatório; o banco guarda apenas o hash SHA-256 dele.
export async function currentUser(r:Request):Promise<CurrentUser|null>{
 const token=readCookie(r,SESSION_COOKIE);
 if(!token||!/^[0-9a-f]{64}$/.test(token))return null;
 const row=await getDb().select({id:users.id,email:users.email,name:users.name}).from(authSessions).innerJoin(users,eq(authSessions.userId,users.id)).where(and(eq(authSessions.id,await sha256Hex(token)),gt(authSessions.expiresAt,Date.now()))).get();
 return row??null;
}

export async function currentUserId(r:Request){return (await currentUser(r))?.id??null}

export async function createSession(userId:string){
 const token=randomHex(32),now=Date.now();
 const db=getDb();
 await db.delete(authSessions).where(and(eq(authSessions.userId,userId),lt(authSessions.expiresAt,now)));
 await db.insert(authSessions).values({id:await sha256Hex(token),userId,expiresAt:now+SESSION_MAX_AGE*1000,createdAt:now});
 return token;
}

export async function destroySession(r:Request){
 const token=readCookie(r,SESSION_COOKIE);
 if(token&&/^[0-9a-f]{64}$/.test(token))await getDb().delete(authSessions).where(eq(authSessions.id,await sha256Hex(token)));
}

export function sessionCookie(r:Request,token:string|null){
 const secure=new URL(r.url).protocol==='https:'?'; Secure':'';
 return token
  ?`${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${secure}`
  :`${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

// Limite simples contra tentativa de senha: 8 falhas em 15 minutos por e-mail.
const WINDOW=15*60*1000,MAX_FAILURES=8;
export async function tooManyFailures(email:string){
 const db=getDb(),since=Date.now()-WINDOW;
 await db.delete(loginFailures).where(lt(loginFailures.createdAt,since));
 const rows=await db.select({id:loginFailures.id}).from(loginFailures).where(and(eq(loginFailures.email,email),gt(loginFailures.createdAt,since))).limit(MAX_FAILURES);
 return rows.length>=MAX_FAILURES;
}
export async function recordFailure(email:string){await getDb().insert(loginFailures).values({id:crypto.randomUUID(),email,createdAt:Date.now()})}
export async function clearFailures(email:string){await getDb().delete(loginFailures).where(eq(loginFailures.email,email))}
