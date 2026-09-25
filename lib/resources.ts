// Links para conteúdos públicos. Nenhum vídeo ou questão de terceiros é copiado para o site.
type Resource={id:string;subject:string;topic:string;title:string;provider:string;kind:string;url:string;sourceUrl:string;usageNote:string;verifiedAt:string};
const portal=(id:number)=>`https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=${id}`;
const note='Link externo; direitos do conteúdo pertencem ao produtor. Abra na plataforma de origem.';
const date='2026-09-25';
const video=(id:string,topic:string,title:string,code:string,module:number):Resource=>({id,subject:'Matemática',topic,title,provider:'Portal da Matemática OBMEP / IMPA',kind:'video',url:`https://www.youtube.com/watch?v=${code}`,sourceUrl:portal(module),usageNote:note,verifiedAt:date});
export const resources:Resource[]=[
 video('potencia-inicio','Potenciação e radiciação','Potência com expoente inteiro positivo','7RKkfP5xmO8',1059),
 video('potencia-propriedades','Potenciação e radiciação','Propriedades das potências','-wg4hnKpk18',1059),
 video('radicais','Potenciação e radiciação','Raiz quadrada de um número','XqwstHtx8gQ',1059),
 video('notacao-cientifica','Notação científica','Notação científica','_qriP0nCMD0',1059),
 video('porcentagem','Porcentagens e juros simples','Porcentagem: definição e exemplos','L6IY8izDAqs',21),
 video('porcentagem-exercicios','Porcentagens e juros simples','Porcentagem: resolução de exercícios','Jw4lqsQ4ibA',21),
 video('expressoes','Expressões algébricas e produtos notáveis','Introdução às expressões algébricas','ZONgblxWDlc',13),
 video('produtos-notaveis','Expressões algébricas e produtos notáveis','Produtos notáveis: quadrado da soma','AvNnnTpwLug',14),
 video('sistemas-adicao','Equações do 1º grau e sistemas','Sistemas: método da adição','iv9HM4Ww_uI',24),
 video('sistemas-substituicao','Equações do 1º grau e sistemas','Sistemas: método da substituição','saNvSoonvSk',24),
 video('geometria-basica','Geometria: ângulos, polígonos e congruência','Elementos básicos de geometria plana','QfbbLdNbkZ0',17),
 video('congruencia','Geometria: ângulos, polígonos e congruência','Congruência de triângulos','swjxo4xoWq8',30),
 {id:'area-exercicios',subject:'Matemática',topic:'Área de figuras planas',title:'Áreas: exercícios comentados da OBMEP',provider:'Portal da Matemática OBMEP / IMPA',kind:'video',url:'https://www.youtube.com/watch?v=YiLEGAxggv4',sourceUrl:'https://www.youtube.com/watch?v=YiLEGAxggv4',usageNote:'Aula complementar de problemas; verifique o nível de dificuldade.',verifiedAt:date},
 {id:'obmep-banco',subject:'Matemática',topic:'Banco externo',title:'Banco de questões e soluções da OBMEP',provider:'OBMEP / IMPA',kind:'repository',url:'https://www.obmep.org.br/banco.htm',sourceUrl:'https://www.obmep.org.br/banco.htm',usageNote:note,verifiedAt:date},
 {id:'obmep-provas',subject:'Matemática',topic:'Banco externo',title:'Provas anteriores e soluções da OBMEP',provider:'OBMEP / IMPA',kind:'repository',url:'https://www.obmep.org.br/provas.htm',sourceUrl:'https://www.obmep.org.br/provas.htm',usageNote:note,verifiedAt:date},
 {id:'khan-matematica',subject:'Matemática',topic:'Banco externo',title:'Curso de Matemática do 8º ano com exercícios',provider:'Khan Academy Brasil',kind:'repository',url:'https://pt.khanacademy.org/math/pt-8-ano',sourceUrl:'https://pt.khanacademy.org/math/pt-8-ano',usageNote:note,verifiedAt:date},
 {id:'khan-portugues',subject:'Língua Portuguesa',topic:'Orações e períodos',title:'Orações e períodos: videoaula e exercícios',provider:'Khan Academy Brasil',kind:'lesson',url:'https://pt.khanacademy.org/humanities/portugues-8-ano/x5b3c6c1b6bb8a9aa%3Alp-8ano-artes-e-literatura/x5b3c6c1b6bb8a9aa%3Alp-8ano-literatura-funcionamento-da-lingua/v/lp-8ano-video-oracoes-e-periodos',sourceUrl:'https://pt.khanacademy.org/humanities/portugues-8-ano/x5b3c6c1b6bb8a9aa%3Alp-8ano-artes-e-literatura/x5b3c6c1b6bb8a9aa%3Alp-8ano-literatura-funcionamento-da-lingua/v/lp-8ano-video-oracoes-e-periodos',usageNote:note,verifiedAt:date},
 {id:'futura-industrial',subject:'História',topic:'Revolução Industrial',title:'Revolução Industrial: aula complementar',provider:'Canal Futura',kind:'video',url:'https://www.youtube.com/watch?v=Yq75DMurZj8',sourceUrl:'https://www.youtube.com/watch?v=Yq75DMurZj8',usageNote:'Vídeo do Ensino Médio para aprofundamento; mediação pedagógica recomendada.',verifiedAt:date},
 {id:'futura-migracao',subject:'Geografia',topic:'Dinâmica populacional e migrações',title:'Migrações e seus tipos: revisão',provider:'Canal Futura',kind:'video',url:'https://www.youtube.com/watch?v=w8wNPv0oXjk',sourceUrl:'https://www.youtube.com/watch?v=w8wNPv0oXjk',usageNote:'Vídeo do 6º ano como revisão introdutória.',verifiedAt:date}
];
