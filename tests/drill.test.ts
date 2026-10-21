import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generators,makeDrill,mulberry32} from '../lib/math-drill.ts';
import {curriculum} from '../lib/curriculum.ts';

const num=(s:string)=>Number(s.replace(/[R$\s]/g,'').replace(/\./g,'').replace(',','.').replace('−','-'));

test('todo exercício gerado tem 4 alternativas distintas, sem valores inválidos', ()=>{
 for(const [topic,gens] of Object.entries(generators)){
  assert.ok(curriculum['Matemática'].includes(topic),`tema fora do currículo: ${topic}`);
  gens.forEach((g,gi)=>{
   const r=mulberry32(1000+gi);
   for(let i=0;i<3000;i++){
    const d=g(r),all=[d.prompt,d.answer,d.explanation,...d.options].join(' ');
    assert.equal(d.options.length,4,d.prompt);
    assert.equal(new Set(d.options).size,4,`repetidas: ${d.prompt} ${d.options}`);
    assert.ok(d.options.includes(d.answer),d.prompt);
    assert.ok(!/NaN|undefined|Infinity|\(\d\)$/.test(all),`inválido: ${all}`);
    assert.ok(!d.options.some(o=>/\(\d\)$/.test(o)),`alternativa de preenchimento: ${d.prompt} ${d.options}`);
   }
  });
 }
});

test('respostas conferidas a partir do enunciado', ()=>{
 const r=mulberry32(7);
 for(let i=0;i<500;i++){
  // Equação ax ± b = c
  let d=generators['Equações do 1º grau e sistemas'][0](r);
  let m=d.prompt.match(/Resolva (\d+)x ([+−]) (\d+) = (-?\d+)\./)!;
  const a=+m[1],b=(m[2]==='−'?-1:1)*+m[3],c=+m[4];assert.equal(a*num(d.answer.slice(4))+b,c,d.prompt);
  // Porcentagem
  d=generators['Porcentagens e juros simples'][0](r);
  m=d.prompt.match(/Quanto é (\d+)% de ([\d.]+)\?/)!;assert.ok(Math.abs(num(m[2])*+m[1]/100-num(d.answer))<1e-9,d.prompt);
  // Juros simples
  d=generators['Porcentagens e juros simples'][2](r);
  m=d.prompt.match(/rendem R\$ ([\d.]+) a juros simples de (\d+)% ao mês durante (\d+) meses/)!;assert.ok(Math.abs(num(m[1])*+m[2]/100*+m[3]-num(d.answer))<1e-6,d.prompt);
  // Soma dos ângulos
  d=generators['Geometria: ângulos, polígonos e congruência'][0](r);
  m=d.prompt.match(/de (\d+) lados/)!;assert.equal((+m[1]-2)*180,num(d.answer.replace('°','')),d.prompt);
  // Raiz quadrada
  d=generators['Potenciação e radiciação'][1](r);
  m=d.prompt.match(/√(\d+)/)!;assert.equal(num(d.answer)**2,+m[1]);
 }
});

test('makeDrill respeita tema e quantidade e é reproduzível pela semente', ()=>{
 const a=makeDrill(10,'Volume e capacidade',42),b=makeDrill(10,'Volume e capacidade',42);
 assert.equal(a.length,10);assert.ok(a.every(d=>d.topic==='Volume e capacidade'));assert.deepEqual(a,b);
 assert.equal(makeDrill(25,'',1).length,25);
});
