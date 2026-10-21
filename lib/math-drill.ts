// Gerador de exercícios de Matemática para o treino rápido. Os números são sorteados e a resposta é
// calculada pelo próprio código, então o gabarito está sempre certo. Não usa IA nem banco de dados.
export type Drill={topic:string;prompt:string;options:string[];answer:string;explanation:string};
export type Rng=()=>number;

const fmt=(n:number,dec=2)=>n.toLocaleString('pt-BR',{maximumFractionDigits:dec});
const money=(n:number)=>'R$ '+n.toLocaleString('pt-BR',{minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2});
const sup=(n:number)=>String(n).replace(/-/g,'⁻').replace(/\d/g,d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
function gcd(a:number,b:number):number{return b?gcd(b,a%b):Math.abs(a)}

export function mulberry32(seed:number):Rng{let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}
const int=(r:Rng,min:number,max:number)=>min+Math.floor(r()*(max-min+1));
const pick=<T,>(r:Rng,items:readonly T[])=>items[Math.floor(r()*items.length)];

// Monta 4 alternativas distintas (a correta + distratores), em ordem sorteada.
function build(r:Rng,topic:string,prompt:string,answer:string,distractors:string[],explanation:string):Drill{
 const opts=[answer];
 for(const d of distractors)if(opts.length<4&&!opts.includes(d))opts.push(d);
 // Reserva: varia o primeiro número da resposta (±1, ±10, ×2…) mantendo o formato.
 const m=answer.match(/-?\d[\d.]*(,\d+)?/);
 if(m){const n=Number(m[0].replace(/\./g,'').replace(',','.'));for(const v of [n+1,n-1,n*2,n+10,n-10,n/2,n+2])if(opts.length<4&&Number.isFinite(v)){const alt=answer.replace(m[0],fmt(v));if(!opts.includes(alt))opts.push(alt)}}
 let k=1;while(opts.length<4){const extra=`${answer} (${k++})`;if(!opts.includes(extra))opts.push(extra)}
 for(let i=opts.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]]}
 return {topic,prompt,options:opts,answer,explanation};
}
// Distratores numéricos próximos, sem repetir a resposta.
function near(ans:number,cands:number[],f=(n:number)=>fmt(n)){return cands.filter(c=>Number.isFinite(c)&&Math.abs(c-ans)>1e-9).map(f)}

type Gen=(r:Rng)=>Drill;
export const generators:Record<string,Gen[]>={
 'Potenciação e radiciação':[
  r=>{const a=int(r,2,9)*(r()<0.3?-1:1),n=int(r,2,4),v=a**n;return build(r,'Potenciação e radiciação',`Quanto vale (${a})${sup(n)}?`,fmt(v),near(v,[a*n,-v,a**(n-1),a**(n+1)]),`Multiplique a base por ela mesma ${n} vezes: ${Array(n).fill(`(${a})`).join(' · ')} = ${fmt(v)}.${a<0?(n%2?' Expoente ímpar mantém o sinal negativo.':' Expoente par deixa o resultado positivo.'):''}`)},
  r=>{const k=int(r,4,20),v=k*k;return build(r,'Potenciação e radiciação',`Quanto é √${v}?`,fmt(k),near(k,[k+1,k-1,v/2,2*k]),`${k} × ${k} = ${v}, então √${v} = ${k}.`)},
  r=>{const b=int(r,2,5),m=int(r,2,6),n=int(r,1,4),e=m+n;return build(r,'Potenciação e radiciação',`Escreva ${b}${sup(m)} · ${b}${sup(n)} como uma única potência.`,`${b}${sup(e)}`,[`${b}${sup(m*n)}`,`${b*b}${sup(e)}`,`${b}${sup(Math.abs(m-n))}`,`${b}${sup(e+1)}`,`${b}${sup(e-1)}`],`Mesma base na multiplicação: conserve a base e some os expoentes, ${m} + ${n} = ${e}.`)},
  r=>{const b=int(r,2,5),n=int(r,1,3),v=b**n;return build(r,'Potenciação e radiciação',`Quanto vale ${b}${sup(-n)}?`,`1/${v}`,[`−${v}`,`${v}`,`−1/${v}`,`1/${b*n}`],`Expoente negativo inverte a base: ${b}${sup(-n)} = 1/${b}${sup(n)} = 1/${v}.`)},
 ],
 'Notação científica':[
  r=>{const d=int(r,11,98)/10,e=int(r,3,8),n=Math.round(d*10**e);return build(r,'Notação científica',`Como se escreve ${fmt(n,0)} em notação científica?`,`${fmt(d,1)} × 10${sup(e)}`,[`${fmt(d,1)} × 10${sup(e+1)}`,`${fmt(d,1)} × 10${sup(e-1)}`,`${fmt(d*10,0)} × 10${sup(e)}`],`O número antes da potência fica entre 1 e 10 (${fmt(d,1)}), e a vírgula anda ${e} casas.`)},
  r=>{const d=int(r,11,98)/10,e=-int(r,2,6),n=d*10**e;const dec=n.toLocaleString('pt-BR',{maximumFractionDigits:10});return build(r,'Notação científica',`Como se escreve ${dec} em notação científica?`,`${fmt(d,1)} × 10${sup(e)}`,[`${fmt(d,1)} × 10${sup(-e)}`,`${fmt(d,1)} × 10${sup(e+1)}`,`${fmt(d,1)} × 10${sup(e-1)}`],`A vírgula anda ${-e} casas para a direita até ${fmt(d,1)}, então o expoente é ${e}.`)},
  r=>{const a=int(r,2,4),b=int(r,2,4),m=int(r,2,6),n=int(r,2,6),p=a*b,e=m+n;const ans=p>=10?`${fmt(p/10,1)} × 10${sup(e+1)}`:`${p} × 10${sup(e)}`;return build(r,'Notação científica',`Calcule (${a} × 10${sup(m)}) × (${b} × 10${sup(n)}) e dê a resposta em notação científica.`,ans,[`${p>=10?fmt(p/10,1):p} × 10${sup(m*n+(p>=10?1:0))}`,`${a+b} × 10${sup(e)}`,`${p>=10?fmt(p/10,1):p} × 10${sup(e+(p>=10?2:1))}`,`${p>=10?fmt(p/10,1):p} × 10${sup(e+(p>=10?0:-1))}`,`${a+b+1} × 10${sup(e)}`],`Multiplique os números (${a} × ${b} = ${p}) e some os expoentes (${m} + ${n} = ${e}).${p>=10?` Como ${p} ≥ 10, ajuste para ${fmt(p/10,1)} × 10${sup(e+1)}.`:''}`)},
 ],
 'Dízimas periódicas e frações geratrizes':[
  r=>{const a=int(r,1,8),g=gcd(a,9);return build(r,'Dízimas periódicas e frações geratrizes',`Qual é a fração geratriz de 0,${String(a).repeat(4)}...?`,`${a/g}/${9/g}`,[`${a}/10`,`${a}/99`,`${a}/100`,`1/${a}`],`Período de um algarismo: ${a}/9${g>1?` = ${a/g}/${9/g}`:''}.`)},
  r=>{const p=int(r,10,98);if(p%11===0)return generators['Dízimas periódicas e frações geratrizes'][0](r);const g=gcd(p,99),s=String(p).padStart(2,'0');return build(r,'Dízimas periódicas e frações geratrizes',`Qual é a fração geratriz de 0,${s.repeat(3)}...?`,`${p/g}/${99/g}`,[`${p}/100`,`${p}/9`,`${p}/90`],`Período de dois algarismos: ${p}/99${g>1?` = ${p/g}/${99/g}`:''}.`)},
 ],
 'Porcentagens e juros simples':[
  r=>{const p=pick(r,[5,10,15,20,25,30,40,50,75]),v=int(r,2,40)*20,ans=p*v/100;return build(r,'Porcentagens e juros simples',`Quanto é ${p}% de ${fmt(v)}?`,fmt(ans),near(ans,[ans*10,ans/10,v-ans,p+v/100]),`${p}% = ${p}/100. Então ${fmt(v)} × ${p}/100 = ${fmt(ans)}.`)},
  r=>{const p=pick(r,[10,15,20,25,30,40]),v=int(r,4,60)*10,down=r()<0.5,ans=down?v*(100-p)/100:v*(100+p)/100;return build(r,'Porcentagens e juros simples',`Um produto de ${money(v)} teve ${down?'desconto':'aumento'} de ${p}%. Qual é o novo preço?`,money(ans),[money(down?v*(100+p)/100:v*(100-p)/100),money(v*p/100),money(down?v-p:v+p),money(down?v*(100-2*p)/100:v*(100+2*p)/100)],`${p}% de ${money(v)} = ${money(v*p/100)}. ${down?'Subtraindo':'Somando'}: ${money(ans)}.`)},
  r=>{const c=int(r,5,50)*100,i=pick(r,[1,2,3,4,5]),t=int(r,2,12),j=c*i*t/100;return build(r,'Porcentagens e juros simples',`Quanto rendem ${money(c)} a juros simples de ${i}% ao mês durante ${t} meses?`,money(j),[money(c+j),money(c*i/100),money(j*10)],`J = C · i · t = ${money(c)} × ${i}/100 × ${t} = ${money(j)}.`)},
 ],
 'Contagem e princípio multiplicativo':[
  r=>{const a=int(r,2,6),b=int(r,2,6),c=int(r,2,5);return build(r,'Contagem e princípio multiplicativo',`Uma lanchonete tem ${a} tipos de pão, ${b} recheios e ${c} bebidas. Quantos combos diferentes (1 de cada) podem ser montados?`,fmt(a*b*c),near(a*b*c,[a+b+c,a*b+c,a*b,a*b*c*2]),`Princípio multiplicativo: ${a} × ${b} × ${c} = ${a*b*c}.`)},
  r=>{const n=int(r,5,10),k=int(r,2,3);let v=1;for(let i=0;i<k;i++)v*=n-i;return build(r,'Contagem e princípio multiplicativo',`De quantas maneiras podem ser escolhidos ${k===2?'um presidente e um vice':'um presidente, um vice e um secretário'} em um grupo de ${n} pessoas?`,fmt(v),near(v,[n**k,n*k,v/(k===2?2:6),v+n]),`A ordem importa e ninguém ocupa dois cargos: ${Array.from({length:k},(_,i)=>n-i).join(' × ')} = ${v}.`)},
 ],
 'Expressões algébricas e produtos notáveis':[
  r=>{const a=int(r,2,6),b=int(r,-5,6)||1,x=int(r,-4,5);const v=a*x+b;return build(r,'Expressões algébricas e produtos notáveis',`Qual é o valor de ${a}x ${b<0?'−':'+'} ${Math.abs(b)} para x = ${x}?`,fmt(v),near(v,[a+x+b,a*x-b,-v,a*(x+b)]),`Substitua x por ${x}: ${a} · (${x}) ${b<0?'−':'+'} ${Math.abs(b)} = ${v}.`)},
  r=>{const k=int(r,2,9),plus=r()<0.5;return build(r,'Expressões algébricas e produtos notáveis',`Desenvolva (x ${plus?'+':'−'} ${k})².`,`x² ${plus?'+':'−'} ${2*k}x + ${k*k}`,[`x² + ${k*k}`,`x² ${plus?'+':'−'} ${k}x + ${k*k}`,`x² ${plus?'−':'+'} ${2*k}x + ${k*k}`,`x² − ${k*k}`],`(a ${plus?'+':'−'} b)² = a² ${plus?'+':'−'} 2ab + b² → x² ${plus?'+':'−'} ${2*k}x + ${k*k}.`)},
 ],
 'Equações do 1º grau e sistemas':[
  r=>{const a=int(r,2,9),x=int(r,-9,12),b=int(r,-15,20),c=a*x+b;return build(r,'Equações do 1º grau e sistemas',`Resolva ${a}x ${b<0?'−':'+'} ${Math.abs(b)} = ${c}.`,`x = ${x}`,near(x,[-x,x+1,(c+b)/a,c-b]).map(s=>`x = ${s}`),`${a}x = ${c} ${b<0?'+':'−'} ${Math.abs(b)} = ${c-b} → x = ${c-b} ÷ ${a} = ${x}.`)},
  r=>{const x=int(r,1,15),y=int(r,1,15);const s=x+y,d=x-y;return build(r,'Equações do 1º grau e sistemas',`Resolva o sistema: x + y = ${s} e x − y = ${d}.`,`x = ${x} e y = ${y}`,[`x = ${y} e y = ${x}`,`x = ${x+1} e y = ${y-1}`,`x = ${s} e y = ${d}`],`Somando as equações: 2x = ${s+d} → x = ${x}. Então y = ${s} − ${x} = ${y}.`)},
 ],
 'Grandezas proporcionais':[
  r=>{const q=int(r,2,6),unit=int(r,2,15),q2=int(r,3,12);if(q2===q)return generators['Grandezas proporcionais'][0](r);const total=q*unit,ans=unit*q2;return build(r,'Grandezas proporcionais',`Se ${q} unidades custam ${money(total)}, quanto custam ${q2} unidades?`,money(ans),[money(total*q2),money(total+q2),money(ans+unit)],`Cada unidade custa ${money(total)} ÷ ${q} = ${money(unit)}; ${q2} × ${money(unit)} = ${money(ans)}.`)},
  r=>{const w=pick(r,[2,3,4,6]),d=pick(r,[6,8,12,24]),w2=pick(r,[2,3,4,6,8,12].filter(v=>v!==w&&(w*d)%v===0));const ans=w*d/w2;return build(r,'Grandezas proporcionais',`${w} máquinas iguais fazem um serviço em ${d} horas. Em quantas horas ${w2} dessas máquinas fazem o mesmo serviço?`,`${fmt(ans)} h`,near(ans,[d*w2/w,d,d+w2-w]).map(s=>`${s} h`),`Inversamente proporcionais: ${w} × ${d} = ${w2} × t → t = ${w*d} ÷ ${w2} = ${fmt(ans)} h.`)},
 ],
 'Geometria: ângulos, polígonos e congruência':[
  r=>{const n=int(r,4,12),s=(n-2)*180;return build(r,'Geometria: ângulos, polígonos e congruência',`Qual é a soma dos ângulos internos de um polígono de ${n} lados?`,`${fmt(s)}°`,near(s,[n*180,(n-1)*180,360,(n-3)*180]).map(v=>`${v}°`),`Soma = (n − 2) × 180° = (${n} − 2) × 180° = ${fmt(s)}°.`)},
  r=>{const a=int(r,10,80),comp=r()<0.5,ans=comp?90-a:180-a;return build(r,'Geometria: ângulos, polígonos e congruência',`Qual é o ${comp?'complemento':'suplemento'} de um ângulo de ${a}°?`,`${ans}°`,near(ans,[comp?180-a:90-a,a,360-a]).map(v=>`${v}°`),`${comp?'Complementares somam 90°':'Suplementares somam 180°'}: ${comp?90:180}° − ${a}° = ${ans}°.`)},
 ],
 'Área de figuras planas':[
  r=>{const b=int(r,3,20),h=int(r,2,15),tri=r()<0.5,A=tri?b*h/2:b*h;return build(r,'Área de figuras planas',`Qual é a área de um ${tri?'triângulo':'retângulo'} de base ${b} cm e altura ${h} cm?`,`${fmt(A)} cm²`,near(A,[tri?b*h:b*h/2,2*(b+h),b+h]).map(v=>`${v} cm²`),tri?`A = base × altura ÷ 2 = ${b} × ${h} ÷ 2 = ${fmt(A)} cm².`:`A = base × altura = ${b} × ${h} = ${A} cm².`)},
  r=>{const rd=int(r,2,12),A=Math.round(3.14*rd*rd*100)/100;return build(r,'Área de figuras planas',`Qual é a área de um círculo de raio ${rd} cm? (Use π ≈ 3,14.)`,`${fmt(A)} cm²`,near(A,[Math.round(2*3.14*rd*100)/100,Math.round(3.14*rd*100)/100,rd*rd]).map(v=>`${v} cm²`),`A = π · r² = 3,14 × ${rd*rd} = ${fmt(A)} cm².`)},
 ],
 'Volume e capacidade':[
  r=>{const a=int(r,2,12)*10,b=int(r,2,10)*10,c=int(r,2,10)*10,V=a*b*c,L=V/1000;return build(r,'Volume e capacidade',`Uma caixa mede ${a} cm × ${b} cm × ${c} cm. Qual é a sua capacidade em litros?`,`${fmt(L)} L`,near(L,[L*10,L/10,(a+b+c)/10]).map(v=>`${v} L`),`V = ${a} × ${b} × ${c} = ${fmt(V)} cm³. Como 1 L = 1 000 cm³, são ${fmt(L)} L.`)},
  r=>{const a=int(r,2,10),V=a**3;return build(r,'Volume e capacidade',`Qual é o volume de um cubo de aresta ${a} cm?`,`${V} cm³`,near(V,[a*a,6*a*a,3*a]).map(v=>`${v} cm³`),`V = a³ = ${a} × ${a} × ${a} = ${V} cm³.`)},
 ],
 'Probabilidade e estatística':[
  r=>{const vals=Array.from({length:4},()=>int(r,2,10));const sum=vals.reduce((x,y)=>x+y,0);if(sum%4){vals[3]+=4-sum%4}const tot=vals.reduce((x,y)=>x+y,0),m=tot/4;return build(r,'Probabilidade e estatística',`Qual é a média de ${vals.join(', ')}?`,fmt(m),near(m,[tot,m+1,m-1,Math.max(...vals)]),`Some os valores (${tot}) e divida por 4: ${fmt(m)}.`)},
  r=>{const red=int(r,1,8),blue=int(r,1,8),t=red+blue,g=gcd(red,t);return build(r,'Probabilidade e estatística',`Uma urna tem ${red} bolas vermelhas e ${blue} azuis. Qual é a probabilidade de sortear uma vermelha?`,`${red/g}/${t/g}`,[`${red}/${blue}`,`${blue}/${t}`,`1/${t}`,`1/${red}`],`Casos favoráveis: ${red}. Total: ${t}. Probabilidade = ${red}/${t}${g>1?` = ${red/g}/${t/g}`:''}.`)},
 ],
};

export const drillTopics=Object.keys(generators);

// Gera `count` exercícios do tema (ou de todos, se topic for vazio).
export function makeDrill(count:number,topic='',seed=Date.now()):Drill[]{
 const r=mulberry32(seed);
 const pool=topic&&generators[topic]?generators[topic]:Object.values(generators).flat();
 return Array.from({length:count},()=>pick(r,pool)(r));
}
