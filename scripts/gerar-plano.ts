// Gera docs/plano-de-estudos-8ano.md a partir dos dados do app (currículo, plano, banco e catálogo).
// Uso: npm run docs:plano
import {writeFileSync} from 'node:fs';
import {curriculum} from '../lib/curriculum.ts';
import {bimester,schoolWeek,topicPlans} from '../lib/study-plan.ts';
import {bankQuestions} from '../lib/bank/index.ts';
import {resources} from '../lib/resources.ts';

const L=['A','B','C','D'];
const out:string[]=[];
out.push('# Plano de estudos · 8º ano do Ensino Fundamental','');
out.push(`Gerado a partir dos dados do Painel de Estudos. ${bankQuestions.length} questões de múltipla escolha com gabarito comentado, distribuídas em ${Object.values(curriculum).flat().length} temas de ${Object.keys(curriculum).length} disciplinas.`,'');
out.push('- **Organização:** 40 semanas letivas, em 4 bimestres de 10 semanas. Cada tema começa na semana indicada e segue até o próximo.');
out.push('- **Rotina sugerida por tema:** assistir às videoaulas, fazer as questões no modo Quiz, revisar os erros no modo Revisão e fechar com um Simulado.');
out.push('- **Questões:** autorais, alinhadas aos temas do 8º ano. Provas e bancos oficiais (OBMEP, OBA, ONHB, OBG) são indicados por link, sem cópia do conteúdo.');
out.push('- **Vídeos:** links para o YouTube e o Portal da Matemática OBMEP; os direitos pertencem aos produtores. Confira cada vídeo antes de usar em aula.','');

out.push('## Visão geral por bimestre','');
out.push('| Disciplina | 1º bimestre | 2º bimestre | 3º bimestre | 4º bimestre |','|---|---|---|---|---|');
for(const [subject,topics] of Object.entries(curriculum)){
 const cols=[1,2,3,4].map(b=>topics.filter((_,i)=>bimester(schoolWeek(i,topics.length))===b).join('; ')||'—');
 out.push(`| ${subject} | ${cols.join(' | ')} |`);
}
out.push('');

for(const [subject,topics] of Object.entries(curriculum)){
 out.push(`## ${subject}`,'');
 topics.forEach((topic,i)=>{
  const w=schoolWeek(i,topics.length),plan=topicPlans[subject]?.[topic];
  const qs=bankQuestions.filter(q=>q.subject===subject&&q.topic===topic);
  const vids=resources.filter(r=>r.subject===subject&&r.topic===topic&&r.kind!=='repository');
  out.push(`### ${topic}`,'',`**Semana ${w} · ${bimester(w)}º bimestre**`,'');
  if(plan){out.push(`**Objetivo:** ${plan.objective}`,'',`**Conceitos-chave:** ${plan.concepts.join('; ')}.`,'')}
  if(vids.length){out.push('**Videoaulas:**','');for(const v of vids)out.push(`- [${v.title}](${v.url}) — ${v.provider}`);out.push('')}
  out.push(`**Questões (${qs.length}):**`,'');
  qs.forEach((q,n)=>{
   out.push(`${n+1}. ${q.prompt} _(${['','fácil','média','desafio'][q.difficulty]})_`);
   q.options.forEach((o,k)=>out.push(`   - ${L[k]}) ${o}`));
   out.push('');
  });
  out.push('<details><summary>Gabarito comentado</summary>','');
  qs.forEach((q,n)=>out.push(`${n+1}. **${L[q.options.indexOf(q.answer)]}) ${q.answer}**: ${q.explanation}`));
  out.push('','</details>','');
 });
}

out.push('## Acervos oficiais e públicos','');
for(const r of resources.filter(r=>r.kind==='repository'))out.push(`- **${r.subject}** · [${r.title}](${r.url}) — ${r.provider}`);
out.push('');
writeFileSync(new URL('../docs/plano-de-estudos-8ano.md',import.meta.url),out.join('\n'));
console.log(`docs/plano-de-estudos-8ano.md: ${out.length} linhas`);
