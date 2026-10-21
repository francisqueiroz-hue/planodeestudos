// Questão de múltipla escolha autoral: [tema, dificuldade, enunciado, alternativas, índice correto, explicação].
// O tema deve ser idêntico a um tema de lib/curriculum.ts para ligar questão, plano e videoaulas.
export type Difficulty=1|2|3;
export type MCQ=readonly [topic:string,difficulty:Difficulty,prompt:string,options:readonly [string,string,string,string],correct:0|1|2|3,explanation:string];
export type SubjectBank={subject:string;items:readonly MCQ[]};
