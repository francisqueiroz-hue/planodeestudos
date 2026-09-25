import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hashPassword,verifyPassword,randomHex,normalizeEmail,validEmail,passwordProblem,normalizeAnswer,safeEqual,fromHex,toHex} from '../lib/password.ts';
import {weekFor} from '../lib/planning.ts';

test('hash e verificação de senha', async()=>{
 const salt=randomHex(16);
 const stored=await hashPassword('senha1234',salt);
 assert.match(stored,/^pbkdf2_sha256\$100000\$[0-9a-f]{64}$/);
 assert.equal(await verifyPassword('senha1234',salt,stored),true);
 assert.equal(await verifyPassword('senha12345',salt,stored),false);
 assert.equal(await verifyPassword('senha1234',randomHex(16),stored),false);
 assert.equal(await verifyPassword('senha1234',salt,'md5$1$abc'),false);
});

test('hex e comparação', ()=>{
 assert.equal(toHex(fromHex('00ff10')),'00ff10');
 assert.throws(()=>fromHex('zz'));
 assert.equal(safeEqual('abc','abc'),true);
 assert.equal(safeEqual('abc','abd'),false);
 assert.equal(safeEqual('abc','abcd'),false);
});

test('validação de e-mail e senha', ()=>{
 assert.equal(normalizeEmail('  Ana@Teste.COM '),'ana@teste.com');
 assert.equal(validEmail('ana@teste.com'),true);
 assert.equal(validEmail('ana@teste'),false);
 assert.ok(passwordProblem('curta1'));
 assert.ok(passwordProblem('somenteletras'));
 assert.ok(passwordProblem('12345678'));
 assert.equal(passwordProblem('estudo2026'),null);
});

test('correção literal ignora acentos, caixa e pontuação', ()=>{
 assert.equal(normalizeAnswer('  Conclusão. '),normalizeAnswer('conclusao'));
 assert.equal(normalizeAnswer('R$ 60'),normalizeAnswer('r 60'));
 assert.notEqual(normalizeAnswer('x = 5'),normalizeAnswer('x = 6'));
});

test('distribuição de temas por semana', ()=>{
 const now=Date.parse('2026-09-25T12:00:00Z');
 assert.deepEqual([0,1,2,3,4].map(i=>weekFor(i,5,null,now)),[1,1,2,2,3]);
 const weeks=Array.from({length:20},(_,i)=>weekFor(i,20,'2026-11-20',now));
 assert.equal(weeks[0],1);assert.equal(Math.max(...weeks),8);
 assert.ok(weeks.every((w,i)=>i===0||w>=weeks[i-1]));
 assert.equal(weekFor(3,5,'2026-09-26',now),1);
 assert.equal(weekFor(3,5,'data-invalida',now),2);
});
