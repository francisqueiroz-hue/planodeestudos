import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bankQuestions,banks} from '../lib/bank/index.ts';
import {curriculum} from '../lib/curriculum.ts';

test('toda questão tem 4 alternativas distintas e gabarito entre elas', ()=>{
 for(const q of bankQuestions){
  assert.equal(q.options.length,4,q.prompt);
  assert.equal(new Set(q.options.map(o=>o.trim().toLowerCase())).size,4,`alternativas repetidas: ${q.prompt}`);
  assert.ok(q.options.includes(q.answer),q.prompt);
  assert.ok(q.explanation.length>10,q.prompt);
 }
});

test('temas e disciplinas existem no currículo e cobrem todos os temas', ()=>{
 for(const b of banks){
  assert.ok(curriculum[b.subject],`disciplina desconhecida: ${b.subject}`);
  for(const item of b.items)assert.ok(curriculum[b.subject].includes(item[0]),`tema fora do currículo: ${b.subject} / ${item[0]}`);
  for(const t of curriculum[b.subject])assert.ok(b.items.filter(i=>i[0]===t).length>=4,`tema com poucas questões: ${t}`);
 }
});

test('enunciados únicos e gabarito bem distribuído entre as posições', ()=>{
 assert.equal(new Set(bankQuestions.map(q=>q.prompt)).size,bankQuestions.length);
 const pos=[0,0,0,0];for(const q of bankQuestions)pos[q.options.indexOf(q.answer)]++;
 for(const p of pos)assert.ok(p>bankQuestions.length*0.15,`distribuição desigual: ${pos}`);
});

test('todo tema tem plano e pelo menos 2 videoaulas; Matemática tem ao menos 15 questões por tema', async()=>{
 const {resources}=await import('../lib/resources.ts');
 const {topicPlans}=await import('../lib/study-plan.ts');
 for(const [subject,topics] of Object.entries(curriculum))for(const t of topics){
  assert.ok(topicPlans[subject]?.[t],`sem plano: ${t}`);
  assert.ok(resources.filter(r=>r.subject===subject&&r.topic===t&&r.kind!=='repository').length>=2,`poucas aulas: ${t}`);
 }
 for(const t of curriculum['Matemática'])assert.ok(bankQuestions.filter(q=>q.subject==='Matemática'&&q.topic===t).length>=15,`Matemática com poucas questões: ${t}`);
 assert.equal(new Set(resources.map(r=>r.id)).size,resources.length,'ids de recursos repetidos');
});
