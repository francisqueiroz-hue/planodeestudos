import type {Difficulty,MCQ,SubjectBank} from './types.ts';
import {matematica} from './matematica.ts';
import {portugues} from './portugues.ts';
import {ciencias} from './ciencias.ts';
import {historia} from './historia.ts';
import {geografia} from './geografia.ts';
import {ingles} from './ingles.ts';
import {arte} from './arte.ts';
import {educacaoFisica} from './educacao-fisica.ts';

export type BankQuestion={subject:string;topic:string;difficulty:Difficulty;prompt:string;options:string[];answer:string;explanation:string};

export const BANK_SOURCE='Banco do Painel · 8º ano';
export const banks:SubjectBank[]=[matematica,portugues,ciencias,historia,geografia,ingles,arte,educacaoFisica];

// Hash FNV-1a: embaralhamento determinístico, igual para todos os estudantes e a cada instalação.
function hash(text:string){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function shuffled(item:MCQ):string[]{
 const opts=[...item[3]];let seed=hash(item[2]);
 for(let i=opts.length-1;i>0;i--){seed=Math.imul(seed^(seed>>>15),2246822507)>>>0;const j=seed%(i+1);[opts[i],opts[j]]=[opts[j],opts[i]]}
 return opts;
}

export const bankQuestions:BankQuestion[]=banks.flatMap(b=>b.items.map(item=>({subject:b.subject,topic:item[0],difficulty:item[1],prompt:item[2],options:shuffled(item),answer:item[3][item[4]],explanation:item[5]})));
