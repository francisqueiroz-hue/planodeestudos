import {curriculum} from './curriculum.ts';

// Planejamento anual do 8º ano: objetivo e conceitos-chave de cada tema.
// A ordem segue lib/curriculum.ts e os temas são distribuídos ao longo de 40 semanas letivas (4 bimestres).
export type TopicPlan={objective:string;concepts:string[]};
export const SCHOOL_WEEKS=40;

export const topicPlans:Record<string,Record<string,TopicPlan>>={
 'Matemática':{
  'Potenciação e radiciação':{objective:'Calcular potências com expoente inteiro, aplicar suas propriedades e relacionar potências e raízes.',concepts:['expoente negativo','propriedades das potências','raiz quadrada exata e aproximada']},
  'Notação científica':{objective:'Escrever e comparar números muito grandes ou muito pequenos em notação científica e operar com eles.',concepts:['potências de 10','multiplicação e divisão em notação científica','ordem de grandeza']},
  'Dízimas periódicas e frações geratrizes':{objective:'Reconhecer dízimas periódicas, obter a fração geratriz e diferenciar números racionais e irracionais.',concepts:['decimal exato e dízima','fração geratriz','racionais e irracionais']},
  'Porcentagens e juros simples':{objective:'Resolver problemas com porcentagens, acréscimos, descontos e juros simples em situações do cotidiano.',concepts:['fator de aumento e de desconto','aumentos sucessivos','J = C · i · t']},
  'Contagem e princípio multiplicativo':{objective:'Resolver problemas de contagem com o princípio multiplicativo e a árvore de possibilidades.',concepts:['princípio multiplicativo','com e sem repetição','quando a ordem importa']},
  'Expressões algébricas e produtos notáveis':{objective:'Calcular o valor numérico de expressões, simplificar termos semelhantes e usar produtos notáveis e fatoração.',concepts:['termos semelhantes','quadrado da soma e da diferença','produto da soma pela diferença']},
  'Equações do 1º grau e sistemas':{objective:'Modelar problemas com equações do 1º grau e sistemas de duas incógnitas e resolvê-los por adição ou substituição.',concepts:['equação equivalente','método da adição','método da substituição']},
  'Grandezas proporcionais':{objective:'Identificar grandezas diretamente e inversamente proporcionais e resolver problemas com regra de três, escalas e razões.',concepts:['direta e inversamente proporcionais','regra de três','escala e velocidade média']},
  'Geometria: ângulos, polígonos e congruência':{objective:'Calcular ângulos internos e diagonais de polígonos e reconhecer os casos de congruência de triângulos.',concepts:['soma dos ângulos internos','ângulos complementares e suplementares','casos LLL, LAL, ALA e LAAo']},
  'Área de figuras planas':{objective:'Calcular áreas de quadriláteros, triângulos e círculos e aplicá-las em problemas práticos.',concepts:['área do trapézio e do losango','área do círculo','relação entre lado e área']},
  'Volume e capacidade':{objective:'Calcular volumes de cubos, paralelepípedos, prismas e cilindros e relacionar volume e capacidade.',concepts:['cm³, dm³ e m³','1 L = 1 dm³','volume do prisma e do cilindro']},
  'Probabilidade e estatística':{objective:'Calcular probabilidades simples e interpretar dados usando média, moda e mediana.',concepts:['espaço amostral','medidas de tendência central','leitura de tabelas e gráficos']},
 },
 'Língua Portuguesa':{
  'Leitura e interpretação de textos':{objective:'Localizar informações explícitas, fazer inferências e reconhecer efeitos de sentido como ironia e linguagem figurada.',concepts:['tema e ideia central','informação implícita','linguagem figurada e ironia']},
  'Argumentação e artigo de opinião':{objective:'Identificar tese, argumentos e contra-argumentos e produzir um artigo de opinião bem fundamentado.',concepts:['tese','tipos de argumento','operadores argumentativos']},
  'Coesão e coerência':{objective:'Usar pronomes e conectivos para ligar as partes do texto e garantir a lógica das ideias.',concepts:['retomada por pronomes','conectivos','coerência lógica']},
  'Orações e períodos':{objective:'Distinguir período simples e composto e classificar orações coordenadas.',concepts:['oração e período','coordenação e subordinação','orações coordenadas sindéticas']},
  'Vozes verbais':{objective:'Reconhecer as vozes ativa, passiva e reflexiva e os efeitos de sentido de cada uma.',concepts:['passiva analítica e sintética','agente da passiva','voz reflexiva']},
  'Pontuação e efeitos de sentido':{objective:'Empregar vírgula, dois-pontos, aspas e reticências, percebendo como a pontuação altera o sentido.',concepts:['vírgula e vocativo','sujeito e verbo sem vírgula','sinais expressivos']},
  'Gêneros jornalísticos e digitais':{objective:'Diferenciar notícia, reportagem, charge e gêneros digitais pela finalidade e pela estrutura.',concepts:['manchete e lide','notícia x reportagem','meme e charge']},
  'Análise de fontes e checagem de informações':{objective:'Avaliar a confiabilidade de informações e aplicar passos de checagem antes de compartilhar.',concepts:['fonte primária','sinais de desinformação','agências de checagem']},
 },
 'Ciências':{
  'Fontes e transformação de energia':{objective:'Classificar fontes de energia e explicar as transformações de energia em usinas e aparelhos.',concepts:['renováveis e não renováveis','conservação da energia','impactos das usinas']},
  'Circuitos elétricos e consumo responsável':{objective:'Montar e analisar circuitos simples e calcular o consumo de energia de aparelhos.',concepts:['circuito fechado','série e paralelo','kWh e consumo consciente']},
  'Reprodução e sexualidade com respeito e informação':{objective:'Compreender a puberdade, a reprodução humana e os métodos contraceptivos, com foco em saúde, consentimento e respeito.',concepts:['sistemas genitais e hormônios','ciclo menstrual','prevenção de ISTs e consentimento']},
  'Sistema Sol, Terra e Lua':{objective:'Explicar dia e noite, estações do ano e solstícios a partir dos movimentos da Terra.',concepts:['rotação e translação','inclinação do eixo','solstícios e equinócios']},
  'Fases da Lua e eclipses':{objective:'Relacionar as posições de Sol, Terra e Lua às fases lunares e aos eclipses.',concepts:['ciclo lunar','eclipse solar e lunar','observação segura']},
  'Clima e mudanças climáticas':{objective:'Diferenciar tempo e clima, interpretar dados meteorológicos e discutir ações contra as mudanças climáticas.',concepts:['instrumentos meteorológicos','efeito estufa','mitigação']},
 },
 'História':{
  'Iluminismo':{objective:'Reconhecer as ideias iluministas e seus pensadores e relacioná-las às críticas ao absolutismo.',concepts:['razão e liberdade','separação dos poderes','liberalismo econômico']},
  'Revolução Industrial':{objective:'Explicar o pioneirismo inglês e as transformações econômicas e sociais da industrialização.',concepts:['máquina a vapor','condições de trabalho','ludismo e sindicatos']},
  'Independência dos Estados Unidos':{objective:'Analisar as causas da independência das Treze Colônias e suas contradições.',concepts:['impostos sem representação','Declaração de 1776','escravidão mantida']},
  'Revolução Francesa':{objective:'Compreender as fases da Revolução Francesa e o legado dos direitos do cidadão.',concepts:['Estados Gerais','Declaração dos Direitos do Homem e do Cidadão','Terror e 18 Brumário']},
  'Independências na América Latina':{objective:'Comparar os processos de independência do Haiti e da América espanhola.',concepts:['criollos','Revolução do Haiti','fragmentação política']},
  'Brasil no século XIX e período regencial':{objective:'Explicar a organização do Império e as revoltas do período regencial.',concepts:['Constituição de 1824 e Poder Moderador','regências','revoltas provinciais']},
  'Escravidão, resistências e abolição':{objective:'Analisar a escravidão, as formas de resistência negra e o processo abolicionista e suas consequências.',concepts:['quilombos','leis abolicionistas','pós-abolição e racismo']},
 },
 'Geografia':{
  'Dinâmica populacional e migrações':{objective:'Interpretar indicadores demográficos e os fluxos migratórios e de refugiados.',concepts:['crescimento vegetativo','pirâmide etária','densidade demográfica']},
  'América Latina e regionalizações':{objective:'Compreender os critérios de regionalização da América e as características da América Latina.',concepts:['critério histórico-cultural','Mercosul','relevo e pontos estratégicos']},
  'África e diversidade territorial':{objective:'Reconhecer a diversidade natural e humana da África e os efeitos da colonização nas fronteiras.',concepts:['regionalização africana','partilha da África','apartheid']},
  'Urbanização e desigualdades':{objective:'Analisar a urbanização latino-americana, seus problemas e soluções de mobilidade.',concepts:['metrópole e conurbação','megacidades','moradia e mobilidade']},
  'Globalização e fluxos':{objective:'Explicar a globalização, os tipos de fluxos e as desigualdades que ela produz.',concepts:['fluxos materiais e imateriais','transnacionais','blocos econômicos']},
  'Recursos naturais e impactos ambientais':{objective:'Avaliar o uso dos recursos naturais na América Latina e os impactos ambientais associados.',concepts:['renováveis e não renováveis','desmatamento e assoreamento','desenvolvimento sustentável']},
 },
 'Língua Inglesa':{
  'Reading comprehension':{objective:'Aplicar estratégias de leitura (skimming e scanning) para compreender textos curtos.',concepts:['skimming','scanning','conectivos (so, because)']},
  'Future forms':{objective:'Usar will e going to para falar de previsões, decisões e planos.',concepts:['will','be going to','forma negativa']},
  'Comparatives and superlatives':{objective:'Comparar pessoas, lugares e objetos com adjetivos curtos, longos e irregulares.',concepts:['-er / more','-est / the most','good, better, the best']},
  'Modal verbs':{objective:'Usar verbos modais para expressar habilidade, permissão, conselho e obrigação.',concepts:['can / could','should','must']},
  'Vocabulary in context':{objective:'Deduzir significados pelo contexto e distinguir cognatos de falsos cognatos.',concepts:['cognatos','falsos cognatos','pistas do contexto']},
  'Digital communication':{objective:'Compreender a linguagem da comunicação digital e praticar a netiqueta e a segurança online.',concepts:['siglas e abreviações','netiqueta','segurança digital']},
 },
 'Arte':{
  'Elementos da linguagem visual':{objective:'Identificar ponto, linha, forma, cor e textura e usá-los em composições.',concepts:['cores primárias e complementares','textura tátil e visual','composição']},
  'Música e cultura brasileira':{objective:'Reconhecer gêneros e artistas da música brasileira e as propriedades do som.',concepts:['samba e forró','música erudita brasileira','altura, intensidade, duração e timbre']},
  'Teatro e expressão':{objective:'Conhecer elementos do texto e da cena teatral e experimentar a improvisação.',concepts:['rubrica e monólogo','improvisação','commedia dell’arte']},
  'Dança e identidade cultural':{objective:'Valorizar danças brasileiras como patrimônio e explorar elementos do movimento.',concepts:['danças populares','níveis e espaço','patrimônio imaterial']},
 },
 'Educação Física':{
  'Esportes e estratégias':{objective:'Classificar esportes pela lógica interna e aplicar táticas de ataque e defesa com fair play.',concepts:['invasão e rede','marcação individual e por zona','fair play']},
  'Jogos e práticas corporais':{objective:'Experimentar jogos de diferentes origens, cooperativos e competitivos, e refletir sobre o tempo de tela.',concepts:['jogo x esporte','jogos indígenas','jogos cooperativos']},
  'Saúde e atividade física':{objective:'Relacionar atividade física, capacidades físicas e cuidados com a saúde.',concepts:['recomendação da OMS','aquecimento e hidratação','resistência aeróbia']},
  'Práticas de aventura e segurança':{objective:'Conhecer práticas de aventura urbanas e na natureza e avaliar seus riscos.',concepts:['skate e parkour','trilha e escalada','equipamentos de proteção']},
 },
};

// Semana de início (1–40) do tema de posição `index` numa disciplina com `total` temas.
export function schoolWeek(index:number,total:number){return Math.floor(index*SCHOOL_WEEKS/Math.max(1,total))+1}
export function bimester(week:number){return Math.min(4,Math.floor((week-1)/10)+1)}

export function planFor(subject:string,topic:string):TopicPlan|null{return topicPlans[subject]?.[topic]??null}
export function findPlan(topic:string):(TopicPlan&{subject:string})|null{
 for(const subject of Object.keys(curriculum)){const p=topicPlans[subject]?.[topic];if(p)return {...p,subject}}
 return null;
}
