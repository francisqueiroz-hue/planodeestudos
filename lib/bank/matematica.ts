import type {SubjectBank} from './types.ts';
import {matematicaExtra} from './matematica-2.ts';

const base:SubjectBank['items']=[
 ['Potenciação e radiciação',1,'Qual é o valor de (−3)⁴?',['−81','81','−12','12'],1,'Expoente par com base negativa dá resultado positivo: (−3)·(−3)·(−3)·(−3) = 81.'],
 ['Potenciação e radiciação',2,'Simplifique 5⁷ ÷ 5⁴.',['5³','5¹¹','1³','5²⁸'],0,'Na divisão de potências de mesma base, conserva-se a base e subtraem-se os expoentes: 7 − 4 = 3.'],
 ['Potenciação e radiciação',1,'Quanto é √144?',['14','12','72','11'],1,'12 × 12 = 144, então a raiz quadrada de 144 é 12.'],
 ['Potenciação e radiciação',2,'Qual é o valor de 2⁻³?',['−8','−6','1/8','1/6'],2,'Expoente negativo inverte a base: 2⁻³ = 1/2³ = 1/8.'],
 ['Potenciação e radiciação',2,'(2³)² é igual a:',['2⁵','2⁶','2⁹','4⁵'],1,'Potência de potência: multiplicam-se os expoentes, 3 × 2 = 6. Logo (2³)² = 2⁶ = 64.'],
 ['Potenciação e radiciação',3,'Entre quais números inteiros consecutivos está √50?',['6 e 7','7 e 8','8 e 9','24 e 25'],1,'7² = 49 e 8² = 64. Como 49 < 50 < 64, √50 está entre 7 e 8 (bem perto de 7).'],

 ['Notação científica',1,'Como se escreve 45 000 000 em notação científica?',['45 × 10⁶','4,5 × 10⁷','4,5 × 10⁶','0,45 × 10⁸'],1,'Na notação científica, o número antes da potência fica entre 1 e 10: 4,5. A vírgula anda 7 casas, então 4,5 × 10⁷.'],
 ['Notação científica',1,'Como se escreve 0,0006 em notação científica?',['6 × 10⁻⁴','6 × 10⁻³','6 × 10⁴','0,6 × 10⁻³'],0,'A vírgula anda 4 casas para a direita até o 6, então o expoente é −4: 6 × 10⁻⁴.'],
 ['Notação científica',2,'Qual é o resultado de (2 × 10³) × (3 × 10⁴)?',['6 × 10⁷','6 × 10¹²','5 × 10⁷','6 × 10¹'],0,'Multiplicam-se os números (2 × 3 = 6) e somam-se os expoentes das potências de 10 (3 + 4 = 7).'],
 ['Notação científica',2,'A distância média entre a Terra e o Sol é de cerca de 150 milhões de km. Em notação científica, isso é:',['1,5 × 10⁶ km','1,5 × 10⁸ km','15 × 10⁷ km','1,5 × 10⁹ km'],1,'150 milhões = 150 000 000 = 1,5 × 10⁸. A opção 15 × 10⁷ tem o mesmo valor, mas não está em notação científica (15 não fica entre 1 e 10).'],
 ['Notação científica',2,'Qual é o resultado de (8 × 10⁹) ÷ (2 × 10³)?',['4 × 10³','4 × 10⁶','6 × 10⁶','4 × 10¹²'],1,'Dividem-se os números (8 ÷ 2 = 4) e subtraem-se os expoentes (9 − 3 = 6).'],
 ['Notação científica',3,'Qual destes números é o maior?',['3,2 × 10⁵','9,9 × 10⁴','1,1 × 10⁶','5 × 10⁵'],2,'Compare primeiro os expoentes: 10⁶ é o maior. 1,1 × 10⁶ = 1 100 000, maior que 500 000.'],

 ['Porcentagens e juros simples',1,'Quanto é 20% de 150?',['30','20','15','35'],0,'20% = 20/100 = 0,2. Então 0,2 × 150 = 30.'],
 ['Porcentagens e juros simples',2,'Um celular de R$ 1.200 teve aumento de 15%. Qual é o novo preço?',['R$ 1.215','R$ 1.380','R$ 1.350','R$ 180'],1,'15% de 1.200 = 180. Novo preço: 1.200 + 180 = R$ 1.380 (ou 1.200 × 1,15).'],
 ['Porcentagens e juros simples',2,'Uma pessoa aplicou R$ 2.000 a juros simples de 3% ao mês durante 4 meses. Quanto recebeu de juros?',['R$ 60','R$ 240','R$ 2.240','R$ 120'],1,'Juros simples: J = C × i × t = 2.000 × 0,03 × 4 = R$ 240. (R$ 2.240 é o montante, não os juros.)'],
 ['Porcentagens e juros simples',2,'Em uma turma de 40 estudantes, 14 usam óculos. Que porcentagem da turma usa óculos?',['14%','30%','35%','40%'],2,'14/40 = 0,35 = 35%.'],
 ['Porcentagens e juros simples',3,'Um produto teve aumento de 10% e, depois, desconto de 10%. Em relação ao preço inicial, ele ficou:',['igual','1% mais barato','1% mais caro','10% mais barato'],1,'Os 10% incidem sobre valores diferentes: 1,10 × 0,90 = 0,99, ou seja, 99% do preço inicial (1% mais barato).'],
 ['Porcentagens e juros simples',3,'Que capital, aplicado a juros simples de 2% ao mês, rende R$ 300 em 5 meses?',['R$ 1.500','R$ 3.000','R$ 6.000','R$ 30.000'],1,'C × 0,02 × 5 = 300 → C × 0,1 = 300 → C = R$ 3.000.'],

 ['Expressões algébricas e produtos notáveis',1,'Qual é o valor de 3x + 2y para x = 4 e y = −1?',['14','10','12','9'],1,'3 · 4 + 2 · (−1) = 12 − 2 = 10.'],
 ['Expressões algébricas e produtos notáveis',2,'Desenvolvendo (x + 5)², obtemos:',['x² + 25','x² + 10x + 25','x² + 5x + 25','2x + 10'],1,'Quadrado da soma: (a + b)² = a² + 2ab + b² → x² + 2·x·5 + 25 = x² + 10x + 25.'],
 ['Expressões algébricas e produtos notáveis',2,'O produto (a − 3)(a + 3) é igual a:',['a² − 9','a² + 9','a² − 6a + 9','a² − 3'],0,'Produto da soma pela diferença: (a + b)(a − b) = a² − b² → a² − 9.'],
 ['Expressões algébricas e produtos notáveis',2,'Simplificando 4x + 3y − x + 2y, obtemos:',['3x + 5y','5x + 5y','3x + y','8xy'],0,'Juntam-se os termos semelhantes: 4x − x = 3x e 3y + 2y = 5y.'],
 ['Expressões algébricas e produtos notáveis',3,'Qual é a forma fatorada de x² − 6x + 9?',['(x − 3)²','(x + 3)²','(x − 9)(x + 1)','(x − 3)(x + 3)'],0,'É um trinômio quadrado perfeito: x² − 2·x·3 + 3² = (x − 3)².'],
 ['Expressões algébricas e produtos notáveis',3,'Usando um produto notável, calcule 101².',['10 101','10 201','10 001','1 201'],1,'101² = (100 + 1)² = 100² + 2·100·1 + 1² = 10 000 + 200 + 1 = 10 201.'],

 ['Equações do 1º grau e sistemas',1,'Resolva 5x − 7 = 18.',['x = 5','x = 2,2','x = 25','x = 11/5'],0,'5x = 18 + 7 = 25, logo x = 25 ÷ 5 = 5.'],
 ['Equações do 1º grau e sistemas',2,'Resolva 2(x + 3) = x + 10.',['x = 7','x = 4','x = 2','x = 16'],1,'2x + 6 = x + 10 → 2x − x = 10 − 6 → x = 4.'],
 ['Equações do 1º grau e sistemas',2,'Qual é a solução do sistema x + y = 12 e x − y = 4?',['x = 6 e y = 6','x = 10 e y = 2','x = 8 e y = 4','x = 4 e y = 8'],2,'Somando as equações: 2x = 16 → x = 8. Então y = 12 − 8 = 4.'],
 ['Equações do 1º grau e sistemas',2,'Em um estacionamento há carros e motos: 20 veículos e 56 rodas ao todo. Quantas são as motos?',['8','12','10','14'],1,'c + m = 20 e 4c + 2m = 56. Substituindo m = 20 − c: 4c + 40 − 2c = 56 → c = 8. Logo, m = 12.'],
 ['Equações do 1º grau e sistemas',3,'A soma de três números inteiros consecutivos é 72. Qual é o maior deles?',['23','24','25','26'],2,'n + (n + 1) + (n + 2) = 72 → 3n + 3 = 72 → n = 23. Os números são 23, 24 e 25.'],
 ['Equações do 1º grau e sistemas',3,'Se 2x + y = 7 e x + 3y = 11, quanto vale x + y?',['4','6','7','5'],3,'Da 1ª equação, y = 7 − 2x. Na 2ª: x + 21 − 6x = 11 → x = 2 e y = 3. Logo x + y = 5.'],

 ['Geometria: ângulos, polígonos e congruência',1,'Qual é a soma dos ângulos internos de um hexágono?',['540°','720°','900°','360°'],1,'Soma = (n − 2) × 180° = (6 − 2) × 180° = 720°.'],
 ['Geometria: ângulos, polígonos e congruência',2,'Quanto mede cada ângulo interno de um pentágono regular?',['72°','90°','108°','120°'],2,'Soma dos ângulos: (5 − 2) × 180° = 540°. Como são 5 ângulos iguais: 540° ÷ 5 = 108°.'],
 ['Geometria: ângulos, polígonos e congruência',1,'Dois ângulos são suplementares e um deles mede 65°. Quanto mede o outro?',['25°','125°','295°','115°'],3,'Ângulos suplementares somam 180°: 180° − 65° = 115°.'],
 ['Geometria: ângulos, polígonos e congruência',2,'Qual destes casos NÃO garante que dois triângulos sejam congruentes?',['LLL','LAL','ALA','AAA'],3,'Com três ângulos iguais (AAA), os triângulos têm a mesma forma, mas podem ter tamanhos diferentes: são semelhantes, não necessariamente congruentes.'],
 ['Geometria: ângulos, polígonos e congruência',2,'Em um triângulo isósceles, o ângulo formado pelos dois lados iguais mede 40°. Quanto mede cada ângulo da base?',['70°','40°','140°','50°'],0,'Os ângulos da base são iguais: (180° − 40°) ÷ 2 = 70°.'],
 ['Geometria: ângulos, polígonos e congruência',3,'Quantas diagonais tem um octógono (polígono de 8 lados)?',['16','20','24','40'],1,'d = n(n − 3)/2 = 8 × 5 / 2 = 20.'],

 ['Área de figuras planas',1,'Qual é a área de um quadrado de lado 9 cm?',['36 cm²','81 cm²','18 cm²','72 cm²'],1,'Área do quadrado = lado × lado = 9 × 9 = 81 cm². (36 cm seria o perímetro.)'],
 ['Área de figuras planas',2,'Um trapézio tem bases de 10 cm e 6 cm e altura de 4 cm. Qual é a sua área?',['32 cm²','64 cm²','40 cm²','24 cm²'],0,'A = (B + b) × h / 2 = (10 + 6) × 4 / 2 = 32 cm².'],
 ['Área de figuras planas',2,'Qual é a área de um círculo de raio 5 cm? (Use π ≈ 3,14.)',['31,4 cm²','78,5 cm²','15,7 cm²','157 cm²'],1,'A = π × r² = 3,14 × 25 = 78,5 cm². (31,4 cm é o comprimento da circunferência.)'],
 ['Área de figuras planas',2,'Um losango tem diagonais de 12 cm e 8 cm. Qual é a sua área?',['96 cm²','20 cm²','48 cm²','40 cm²'],2,'A = (D × d) / 2 = (12 × 8) / 2 = 48 cm².'],
 ['Área de figuras planas',3,'Um terreno retangular mede 20 m por 15 m. Se cada metro quadrado de grama custa R$ 12, quanto custa gramar o terreno todo?',['R$ 420','R$ 840','R$ 4.200','R$ 3.600'],3,'Área = 20 × 15 = 300 m². Custo = 300 × 12 = R$ 3.600.'],
 ['Área de figuras planas',3,'Se o lado de um quadrado dobra, o que acontece com a área?',['dobra','triplica','fica 4 vezes maior','não muda'],2,'Com lado 2L, a área é (2L)² = 4L²: quatro vezes a área original.'],

 ['Probabilidade e estatística',1,'Ao lançar um dado comum, qual é a probabilidade de sair um número par?',['1/6','1/3','1/2','2/3'],2,'Há 3 resultados pares (2, 4, 6) entre 6 possíveis: 3/6 = 1/2.'],
 ['Probabilidade e estatística',2,'Uma urna tem 3 bolas vermelhas e 5 azuis. Sorteando uma bola, qual é a probabilidade de ela ser vermelha?',['3/5','3/8','5/8','1/3'],1,'Casos favoráveis: 3. Total de bolas: 3 + 5 = 8. Probabilidade = 3/8.'],
 ['Probabilidade e estatística',1,'Qual é a moda do conjunto 2, 5, 5, 7, 9?',['5','7','5,6','2'],0,'Moda é o valor que mais se repete: o 5 aparece duas vezes.'],
 ['Probabilidade e estatística',2,'Qual é a mediana do conjunto 3, 8, 1, 6, 4?',['6','4','4,4','8'],1,'Em ordem: 1, 3, 4, 6, 8. O termo do meio é 4. (4,4 é a média.)'],
 ['Probabilidade e estatística',2,'Lançando duas moedas, qual é a probabilidade de sair cara nas duas?',['1/2','1/3','1/4','3/4'],2,'Resultados possíveis: CC, CK, KC, KK. Só um é “duas caras”: 1/4.'],
 ['Probabilidade e estatística',3,'As notas 6, 7, 8 e x têm média 7,5. Qual é o valor de x?',['7,5','8','10','9'],3,'Soma = 7,5 × 4 = 30. Então 6 + 7 + 8 + x = 30 → x = 9.'],
];

export const matematica:SubjectBank={subject:'Matemática',items:[...base,...matematicaExtra]};
