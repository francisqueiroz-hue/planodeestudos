// Links para conteúdos públicos. Nenhum vídeo ou questão de terceiros é copiado para o site.
export type Resource={id:string;subject:string;topic:string;title:string;provider:string;kind:string;url:string;sourceUrl:string;usageNote:string;verifiedAt:string};

const note='Link externo; os direitos do conteúdo pertencem ao produtor. Abra na plataforma de origem.';
const searched='Título e endereço conferidos por busca na web; confira o vídeo antes de indicar em aula.';
const date='2026-09-25';
const portal=(id:number)=>`https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=${id}`;
const yt=(code:string)=>`https://www.youtube.com/watch?v=${code}`;

// Videoaulas do Portal da Matemática OBMEP (IMPA), com link para o módulo de origem.
const obmep=(id:string,topic:string,title:string,code:string,module:number):Resource=>({id,subject:'Matemática',topic,title,provider:'Portal da Matemática OBMEP / IMPA',kind:'video',url:yt(code),sourceUrl:portal(module),usageNote:note,verifiedAt:date});
// Videoaulas encontradas no YouTube por tema; o canal aparece no próprio vídeo.
const video=(id:string,subject:string,topic:string,title:string,code:string,provider='YouTube'):Resource=>({id,subject,topic,title,provider,kind:'video',url:yt(code),sourceUrl:yt(code),usageNote:`${note} ${searched}`,verifiedAt:date});
const repo=(id:string,subject:string,title:string,provider:string,url:string):Resource=>({id,subject,topic:'Banco externo',title,provider,kind:'repository',url,sourceUrl:url,usageNote:note,verifiedAt:date});

export const resources:Resource[]=[
 // ---------- Matemática ----------
 obmep('potencia-inicio','Potenciação e radiciação','Potência com expoente inteiro positivo','7RKkfP5xmO8',1059),
 obmep('potencia-propriedades','Potenciação e radiciação','Propriedades das potências','-wg4hnKpk18',1059),
 obmep('radicais','Potenciação e radiciação','Raiz quadrada de um número','XqwstHtx8gQ',1059),
 obmep('notacao-cientifica','Notação científica','Notação científica','_qriP0nCMD0',1059),
 video('notacao-cientifica-2','Matemática','Notação científica','Notação Científica e Dízimas Periódicas I – 04','apx0IFD-Xfs','Portal da Matemática OBMEP / IMPA'),
 video('dizimas-rioeduca','Matemática','Dízimas periódicas e frações geratrizes','Fração geratriz de uma dízima periódica | Rioeduca na TV – 8º ano','fwDUlo0d-hw','Rioeduca na TV'),
 video('dizimas-8ano','Matemática','Dízimas periódicas e frações geratrizes','8º ano – Matemática – Dízimas periódicas e fração geratriz','aLu_SAbTieg'),
 obmep('porcentagem','Porcentagens e juros simples','Porcentagem: definição e exemplos','L6IY8izDAqs',21),
 obmep('porcentagem-exercicios','Porcentagens e juros simples','Porcentagem: resolução de exercícios','Jw4lqsQ4ibA',21),
 video('contagem-8ano','Matemática','Contagem e princípio multiplicativo','8º ano – Matemática – Princípio multiplicativo da contagem','OixEVgAp8N4'),
 video('contagem-arvore','Matemática','Contagem e princípio multiplicativo','Princípio fundamental da contagem – 8º ano','3qrupf2496g'),
 obmep('expressoes','Expressões algébricas e produtos notáveis','Introdução às expressões algébricas','ZONgblxWDlc',13),
 obmep('produtos-notaveis','Expressões algébricas e produtos notáveis','Produtos notáveis: quadrado da soma','AvNnnTpwLug',14),
 obmep('sistemas-adicao','Equações do 1º grau e sistemas','Sistemas: método da adição','iv9HM4Ww_uI',24),
 obmep('sistemas-substituicao','Equações do 1º grau e sistemas','Sistemas: método da substituição','saNvSoonvSk',24),
 video('sistemas-duas-incognitas','Matemática','Equações do 1º grau e sistemas','Sistemas de equações do 1º grau com duas incógnitas – 09','buPEocRj2cg','Portal da Matemática OBMEP / IMPA'),
 video('grandezas-inversas','Matemática','Grandezas proporcionais','Grandezas inversamente proporcionais – 8º ano','Jkc9_CKw3Tg'),
 video('regra-de-tres','Matemática','Grandezas proporcionais','Regra de três simples: grandezas diretamente proporcionais','goqyLABRxjo'),
 obmep('geometria-basica','Geometria: ângulos, polígonos e congruência','Elementos básicos de geometria plana','QfbbLdNbkZ0',17),
 obmep('congruencia','Geometria: ângulos, polígonos e congruência','Congruência de triângulos','swjxo4xoWq8',30),
 video('congruencia-aplicacoes','Matemática','Geometria: ângulos, polígonos e congruência','Congruência de triângulos e aplicações – 01','2LS4h1yu7pc','Portal da Matemática OBMEP / IMPA'),
 video('area-brasil-escola','Matemática','Área de figuras planas','Áreas de figuras planas – Brasil Escola','udOTEHMoUNA','Brasil Escola'),
 video('area-poligonos-8ano','Matemática','Área de figuras planas','8º ano | Matemática – Área de figuras planas: área de polígonos II','hY818nmRjBo'),
 {id:'area-exercicios',subject:'Matemática',topic:'Área de figuras planas',title:'Áreas: exercícios comentados da OBMEP',provider:'Portal da Matemática OBMEP / IMPA',kind:'video',url:yt('YiLEGAxggv4'),sourceUrl:yt('YiLEGAxggv4'),usageNote:'Aula complementar de problemas; verifique o nível de dificuldade.',verifiedAt:date},
 video('volume-capacidade','Matemática','Volume e capacidade','8º ano – Medidas de volume e capacidade','DgdDx8DCHrQ'),
 video('volume-cilindro','Matemática','Volume e capacidade','Volume do cilindro – 8º ano','8vnJHOUYsFQ'),
 video('probabilidade-8ano','Matemática','Probabilidade e estatística','8º Ano | Matemática | Aula 97 – Contagem e Probabilidade','yfrXJOSEQJ4'),
 video('probabilidade-obmep','Matemática','Probabilidade e estatística','OBMEP – Probabilidade','8xWtYctACh0'),

 // ---------- Língua Portuguesa ----------
 video('lp-intencoes-autor','Língua Portuguesa','Leitura e interpretação de textos','8º ano – Leitura e interpretação de textos: intenções do autor','GtkYLxIL00Y'),
 video('lp-interpretacao-exercicios','Língua Portuguesa','Leitura e interpretação de textos','Língua Portuguesa, 8º ano: interpretação textual – exercícios','7mJV0Bgnyq4'),
 video('lp-tese-argumento','Língua Portuguesa','Argumentação e artigo de opinião','8º ano – Opinião, argumento e tese no artigo de opinião','JuimdWiq9vg'),
 video('lp-artigo-opiniao','Língua Portuguesa','Argumentação e artigo de opinião','Tudo sobre o artigo de opinião – 8º e 9º ano','QUg1dHU1tt4'),
 video('lp-coesao-coerencia','Língua Portuguesa','Coesão e coerência','Coesão e coerência – Língua Portuguesa – 8º ano','UxC_LkaHzRs'),
 video('lp-coesao-exercicios','Língua Portuguesa','Coesão e coerência','Coesão e coerência textual: aula, exemplos e exercícios','qyGqAtbbEaU'),
 {id:'khan-portugues',subject:'Língua Portuguesa',topic:'Orações e períodos',title:'Orações e períodos: videoaula e exercícios',provider:'Khan Academy Brasil',kind:'lesson',url:'https://pt.khanacademy.org/humanities/portugues-8-ano/x5b3c6c1b6bb8a9aa%3Alp-8ano-artes-e-literatura/x5b3c6c1b6bb8a9aa%3Alp-8ano-literatura-funcionamento-da-lingua/v/lp-8ano-video-oracoes-e-periodos',sourceUrl:'https://pt.khanacademy.org/humanities/portugues-8-ano',usageNote:note,verifiedAt:date},
 video('lp-periodo-composto','Língua Portuguesa','Orações e períodos','Período composto: orações coordenadas e subordinadas','2JeNi0LlpUU'),
 video('lp-oracoes-coordenadas','Língua Portuguesa','Orações e períodos','Orações coordenadas – Brasil Escola','_n0bmFmJpUg','Brasil Escola'),
 video('lp-vozes-8ano','Língua Portuguesa','Vozes verbais','Vozes verbais – Língua Portuguesa – 8º ano','2dzvNJddltY'),
 video('lp-vozes-brasil-escola','Língua Portuguesa','Vozes verbais','Vozes verbais – Brasil Escola','PEN8DatJmfg','Brasil Escola'),
 video('lp-pontuacao-sentido','Língua Portuguesa','Pontuação e efeitos de sentido','Aula 13 – Pontuação? Pontuação! E seus efeitos de sentido','7hzDytthua4'),
 video('lp-sinais-pontuacao','Língua Portuguesa','Pontuação e efeitos de sentido','Língua Portuguesa – Sinais de pontuação – Ensino Fundamental','RhHHJHvcsTI'),
 video('lp-reportagem','Língua Portuguesa','Gêneros jornalísticos e digitais','Reportagem e fotorreportagem – Língua Portuguesa – 8º ano','jYUg7lqWEpM'),
 video('lp-reportagem-brasil-escola','Língua Portuguesa','Gêneros jornalísticos e digitais','Reportagem | Gêneros textuais – Brasil Escola','k9EDaXAWuJw','Brasil Escola'),
 video('lp-fake-news','Língua Portuguesa','Análise de fontes e checagem de informações','Educação midiática: como identificar uma fake news?','iTJYMJAQLpQ'),
 video('lp-fake-news-brasil-escola','Língua Portuguesa','Análise de fontes e checagem de informações','Fake news | Atualidades – Brasil Escola','HfkY0IYS52k','Brasil Escola'),

 // ---------- Ciências ----------
 video('ci-fontes-energia','Ciências','Fontes e transformação de energia','Fontes e tipos de energia – Ciências – 8º ano','6DF3GpAfJOU'),
 video('ci-energia-renovavel','Ciências','Fontes e transformação de energia','Energia renovável – Ciências – 8º ano','qA2WkNZYeu0'),
 video('ci-circuitos','Ciências','Circuitos elétricos e consumo responsável','Circuitos elétricos no cotidiano – Ciências – 8º ano','N0DnSlhijOU'),
 video('ci-consumo','Ciências','Circuitos elétricos e consumo responsável','Cálculo de consumo de energia elétrica – Ciências – 8º ano','GDT1uVbethI'),
 video('ci-puberdade','Ciências','Reprodução e sexualidade com respeito e informação','8º ano – Ciências – Reprodução humana e puberdade','95xa0jskQF8'),
 video('ci-contraceptivos','Ciências','Reprodução e sexualidade com respeito e informação','Métodos contraceptivos – Ciências – 8º ano','3BFovRk3CR0'),
 video('ci-estacoes','Ciências','Sistema Sol, Terra e Lua','O eixo da Terra e as estações do ano – Ciências – 8º ano','gX_DfJzqG7g'),
 video('ci-estacoes-rioeduca','Ciências','Sistema Sol, Terra e Lua','Como ocorrem as estações do ano? | Rioeduca na TV – 8º ano','ESvXGN0t9nI','Rioeduca na TV'),
 video('ci-fases-lua','Ciências','Fases da Lua e eclipses','A Lua e suas fases – Ciências – 8º ano','3Wefx4Vpx1M'),
 video('ci-eclipses','Ciências','Fases da Lua e eclipses','Eclipse solar e lunar – Ciências – 8º ano','nQEx0tZyDNc'),
 video('ci-clima-tempo','Ciências','Clima e mudanças climáticas','8º ano – Ciências – Qual é a diferença entre clima e tempo?','HPCAndsdnz0'),
 video('ci-alteracoes-climaticas','Ciências','Clima e mudanças climáticas','Alterações climáticas e ação humana – Ciências – 8º ano','debZ-ChunPE'),

 // ---------- História ----------
 video('hi-iluminismo','História','Iluminismo','Iluminismo – História – 8º ano','ALbMymyZDH4'),
 video('hi-iluminismo-brasil-escola','História','Iluminismo','Iluminismo – Brasil Escola','Iq-GZbx_mFo','Brasil Escola'),
 video('hi-revolucao-industrial','História','Revolução Industrial','Revolução Industrial – História – 8º ano','YCOzYyV3axY'),
 video('hi-revolucao-industrial-rioeduca','História','Revolução Industrial','Revolução Industrial | Rioeduca na TV – 8º ano','aRPWMxW2poo','Rioeduca na TV'),
 video('hi-independencia-eua','História','Independência dos Estados Unidos','Independência dos EUA – História – 8º ano','a-U6YRARAqc'),
 video('hi-treze-colonias-rioeduca','História','Independência dos Estados Unidos','Independência das 13 colônias | Rioeduca na TV – 8º ano','Ykmu7g_p83k','Rioeduca na TV'),
 video('hi-revolucao-francesa','História','Revolução Francesa','Revolução Francesa: antecedentes e desdobramentos – 8º ano','KER-IaQhIC8'),
 video('hi-revolucao-francesa-rioeduca','História','Revolução Francesa','Revolução Francesa | Rioeduca na TV – 8º ano','xSiikzUdMr8','Rioeduca na TV'),
 video('hi-america-espanhola','História','Independências na América Latina','Independências da América Espanhola – História – 8º ano','YYofNqQE6-c'),
 video('hi-haiti','História','Independências na América Latina','Independência do Haiti – História – 8º ano','UuiIv-aD4OA'),
 video('hi-primeiro-reinado-regencias','História','Brasil no século XIX e período regencial','Primeiro Reinado, Período Regencial e contestações do poder central – 8º ano','zIu_IN0i4Fc'),
 video('hi-regencial-rioeduca','História','Brasil no século XIX e período regencial','Período regencial: a unidade sob ameaça | Rioeduca na TV – 8º ano','ayzfoJmRYFA','Rioeduca na TV'),
 video('hi-abolicionismo','História','Escravidão, resistências e abolição','Escravismo e abolicionismo no Brasil do século XIX – 8º ano','dZown3gnsn4'),
 video('hi-resistencia','História','Escravidão, resistências e abolição','Escravidão e resistência africana nas Américas','_x2F8YRW03w'),

 // ---------- Geografia ----------
 video('ge-dinamica-demografica','Geografia','Dinâmica populacional e migrações','Geografia – 8º ano – Dinâmica demográfica','WTneDnEttLM'),
 video('ge-migracoes','Geografia','Dinâmica populacional e migrações','8º ano | Geografia – Migrações e fluxos migratórios','tmJrgkVNa84'),
 video('ge-america-latina','Geografia','América Latina e regionalizações','O território da América Latina – Geografia – 8º ano','WjdAH_OC-vE'),
 video('ge-formacao-americas','Geografia','América Latina e regionalizações','8º ano – A formação da América Latina e da América Anglo-Saxônica','Pt3THGinsoI'),
 video('ge-africa-territorio','Geografia','África e diversidade territorial','O território africano – Geografia – 8º ano','XjorS2hXTDw'),
 video('ge-africa-natural','Geografia','África e diversidade territorial','Estudando os aspectos naturais da África – Geografia – 8º ano','HPxcNNxVADE'),
 video('ge-urbanizacao-al','Geografia','Urbanização e desigualdades','8º ano – Urbanização na América Latina','ksH-hEEa1j0'),
 video('ge-problemas-urbanos','Geografia','Urbanização e desigualdades','8º ano – Os problemas urbanos na América Latina','2oepMxfKmw4'),
 video('ge-globalizacao','Geografia','Globalização e fluxos','Globalização: causas e consequências | Rioeduca na TV – 8º ano','iJKjTEzNliU','Rioeduca na TV'),
 video('ge-globalizacao-desigualdade','Geografia','Globalização e fluxos','Globalização e desigualdade | Rioeduca na TV – 8º ano','jxml7kqXO2Y','Rioeduca na TV'),
 video('ge-recursos-al','Geografia','Recursos naturais e impactos ambientais','8º ano – Geografia – América Latina: recursos naturais e economia','aOAhXTUv87A'),
 video('ge-recursos-impactos','Geografia','Recursos naturais e impactos ambientais','Recursos naturais e impactos ambientais (9º ano, revisão)','bzNoj8AH-hc'),

 // ---------- Língua Inglesa ----------
 video('en-skimming','Língua Inglesa','Reading comprehension','8º ano | Inglês – Estratégias de leitura: skimming','sTNma2Rz0rM'),
 video('en-reading-strategies','Língua Inglesa','Reading comprehension','Reading strategies: estratégias de leitura – Língua Inglesa','q23ozOqcENI'),
 video('en-future-tenses','Língua Inglesa','Future forms','Future tenses: verbos que indicam futuro – Língua Inglesa – 8º ano','jnq-uSJwamc'),
 video('en-will-going-to','Língua Inglesa','Future forms','Inglês 8º ano – Future: will x going to','i0z7Vf1BZzw'),
 video('en-comparative','Língua Inglesa','Comparatives and superlatives','Comparative and superlative – Língua Inglesa – 8º ano','xa0_sVoVXXk'),
 video('en-comparativos','Língua Inglesa','Comparatives and superlatives','8º ano – Língua Inglesa – Comparativos e superlativos','56JrvAY6UaY'),
 video('en-modal-verbs','Língua Inglesa','Modal verbs','Vídeo-aula sobre modal verbs – Inglês – 8º ano','ZLByrgDalLE'),
 video('en-modals-part1','Língua Inglesa','Modal verbs','Modal verbs part 1: can, could, should, must, have to','Nl4cUp0f0ZE'),
 video('en-cognatos','Língua Inglesa','Vocabulary in context','Cognato e falso cognato – Língua Inglesa','R6W-HHWtRpA'),
 video('en-pistas-contexto','Língua Inglesa','Vocabulary in context','Palavras cognatas e pistas do contexto discursivo','3kxwVLslcGY'),
 video('en-internetes','Língua Inglesa','Digital communication','Internet language: internetês – Língua Inglesa','oj4TH6D2CqI'),
 video('en-generos-digitais','Língua Inglesa','Digital communication','Novos gêneros digitais e novas formas de escrita – Língua Inglesa','bPEd72_OsHk'),

 // ---------- Arte ----------
 video('ar-linguagem-visual','Arte','Elementos da linguagem visual','8º ano | Arte – Elementos da linguagem visual: pontos, linhas, texturas, cor e forma','TJ3Gb31gruM'),
 video('ar-linguagem-visual-2','Arte','Elementos da linguagem visual','Elementos da linguagem visual: linhas, formas, ponto, pontilhismo e cor','Cb1UCTezEN0'),
 video('ar-mpb','Arte','Música e cultura brasileira','8º ano – Arte – Música popular brasileira','yXN50rlN07A'),
 video('ar-cultura-musical','Arte','Música e cultura brasileira','Arte e cultura musical brasileira – Aula 1','jSHThDg3nTs'),
 video('ar-cena-teatral','Arte','Teatro e expressão','8º ano – Arte – Construção da cena teatral e seus elementos','YBw8HiHtF3I'),
 video('ar-teatro','Arte','Teatro e expressão','8º ano – Arte – Teatro','8ETqqlld9kE'),
 video('ar-historia-danca','Arte','Dança e identidade cultural','8º ano | Arte – História da dança','sH6nVP-v27Y'),
 video('ar-danca-cultural','Arte','Dança e identidade cultural','8º ano – Dança como instrumento de manifestação cultural','GtX-98TMRU4'),

 // ---------- Educação Física ----------
 video('ef-invasao','Educação Física','Esportes e estratégias','8º ano – Educação Física – Esportes de invasão / territorial','Gcnl8TF2EQE'),
 video('ef-invasao-2','Educação Física','Esportes e estratégias','8º ano | Educação Física – Esportes de invasão – parte 1','7qXg9BZq7VQ'),
 video('ef-jogos','Educação Física','Jogos e práticas corporais','8º e 9º ano | Educação Física – Jogos e brincadeiras','dZQCeDi41R0'),
 video('ef-cultura-corporal','Educação Física','Jogos e práticas corporais','Cultura corporal de movimento: jogos e brincadeiras','Ygese_BgaoI'),
 video('ef-capacidades','Educação Física','Saúde e atividade física','8º ano – Educação Física – As capacidades físicas','brTMYluBvV0'),
 video('ef-atividade-saude','Educação Física','Saúde e atividade física','Atividade física e saúde','2U67CpBheOU'),
 video('ef-aventura','Educação Física','Práticas de aventura e segurança','8º ano | Educação Física – Práticas corporais de aventura','asp-B9QIOG0'),
 video('ef-aventura-urbana','Educação Física','Práticas de aventura e segurança','Educação Física – Práticas corporais de aventura urbanas','fzbi9rmzL0M'),

 // ---------- Acervos oficiais e públicos (questões e provas ficam na fonte) ----------
 repo('obmep-banco','Matemática','Banco de questões e soluções da OBMEP','OBMEP / IMPA','https://www.obmep.org.br/banco.htm'),
 repo('obmep-provas','Matemática','Provas anteriores e soluções da OBMEP (Nível 2: 8º e 9º ano)','OBMEP / IMPA','https://www.obmep.org.br/provas.htm'),
 repo('portal-obmep-8ano','Matemática','Portal da Matemática: módulos do 8º ano com exercícios resolvidos','Portal da Matemática OBMEP / IMPA','https://portaldaobmep.impa.br/index.php/modulo/lista?serie=3'),
 repo('khan-matematica','Matemática','Curso de Matemática do 8º ano com exercícios','Khan Academy Brasil','https://pt.khanacademy.org/math/pt-8-ano'),
 repo('khan-lp','Língua Portuguesa','Curso de Língua Portuguesa do 8º ano','Khan Academy Brasil','https://pt.khanacademy.org/humanities/portugues-8-ano'),
 repo('saeb-matrizes','Língua Portuguesa','Matrizes de referência de Língua Portuguesa e Matemática do Saeb','Inep','https://download.inep.gov.br/publicacoes/institucionais/avaliacoes_e_exames_da_educacao_basica/matriz_de_referencia_de_lingua_portuguesa_e_matematica_do_saeb.pdf'),
 repo('oba-provas','Ciências','Provas e gabaritos da Olimpíada Brasileira de Astronomia e Astronáutica','OBA','https://novo.oba.org.br/provas'),
 repo('onhb','História','Olimpíada Nacional em História do Brasil (edições anteriores)','ONHB / Unicamp','https://www.olimpiadadehistoria.com.br/'),
 repo('obg-anteriores','Geografia','Edições anteriores da Olimpíada Brasileira de Geografia','OBG','https://obgeografia.com.br/edicoes-anteriores/'),
 repo('bncc','Língua Portuguesa','Base Nacional Comum Curricular (BNCC)','Ministério da Educação','https://basenacionalcomum.mec.gov.br/'),
];
