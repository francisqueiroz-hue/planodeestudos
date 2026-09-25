// Distribui os temas em semanas até a data da prova (ou 2 temas por semana, sem data).
export function weekFor(position:number,total:number,examDate:string|null,now=Date.now()){
 const exam=examDate?Date.parse(examDate+'T12:00:00Z'):NaN;
 if(!Number.isFinite(exam))return Math.floor(position/2)+1;
 const weeks=Math.max(1,Math.floor((exam-now)/(7*24*3600*1000)));
 return Math.min(weeks,Math.floor(position*weeks/Math.max(1,total))+1);
}
