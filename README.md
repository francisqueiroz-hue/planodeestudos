# Painel de Estudos · 8º ano · foco em Matemática

Aplicação web para organizar os estudos do 8º ano do Ensino Fundamental: plano por temas, banco de questões com gabarito, tutor com IA (Claude), leitura de PDFs e fotos, e controle do tempo de estudo.

Roda na Cloudflare (Workers + banco D1 + armazenamento R2), com [vinext](https://github.com/cloudflare/vinext) (Next.js App Router sobre Vite).

## Funcionalidades

| Área | O que faz |
|---|---|
| **Matemática** (tela inicial) | Os 12 temas de Matemática do 8º ano (BNCC), com objetivo, semana do plano, progresso e % de acertos por tema; 181 questões de múltipla escolha com gabarito comentado (15 ou mais por tema); **treino rápido** com exercícios gerados na hora, sem limite e com resposta calculada pelo código; simulado e revisão de erros só de Matemática. |
| **Página inicial** | Apresentação em cartões (prática, simulado, tutor, foto, plano e progresso) e cadastro/login. |
| **Início** | Minutos na semana, dias seguidos, % de acertos, temas concluídos, cronômetro (continua contando ao trocar de seção), gráfico de 7 dias, próximos temas e desempenho por disciplina. |
| **Plano** | Plano anual (40 semanas, 4 bimestres) por disciplina, com objetivo e conceitos-chave de cada tema, videoaulas vinculadas e atalho para as questões do tema; ou plano próprio com data da prova. |
| **Praticar** | Banco com 266 questões de múltipla escolha (A–D) e gabarito comentado, cobrindo os 49 temas, com níveis fácil, média e desafio; mais 46 questões abertas. Modos Quiz, Flashcards (cartão que vira, atalhos de teclado), Revisão (só o que você errou), Simulado oral ou escrito (uma pergunta por vez, cronômetro e nota final) e Exercícios (gerar com IA ou criar à mão). Resposta por texto ou voz. |
| **Tutor** | Chat passo a passo com esfera animada (ouvindo/pensando/falando), ditado, leitura em voz alta, foto do exercício pela câmera e material de apoio. |
| **Materiais** | Upload de PDF, PNG, JPG ou TXT (até 15 MB), leitura com IA (até 8 MB), anotações e opção de ouvir o conteúdo. |

Voz (ditado e leitura) usa a Web Speech API do navegador: sem custo e sem enviar áudio ao servidor. Funciona melhor no Chrome, Edge e Safari; sem suporte, o simulado oral vira escrito.

Sem chave de IA, o app funciona normalmente e apenas desativa tutor, leitura de arquivos, geração e correção por significado.

## Uso pessoal

- A primeira conta criada é a sua. Depois dela, **o cadastro fica fechado**: ninguém mais consegue criar conta, e a tela inicial só mostra “Entrar”. Isso protege seus dados e o custo da IA.
- Para liberar novos cadastros (por exemplo, para um irmão ou um aluno), defina a variável `ALLOW_SIGNUP=true` (`npx wrangler secret put ALLOW_SIGNUP` ou em `.dev.vars` no ambiente local).
- No cadastro, o app já cria a **Trilha de Matemática** (12 temas em 40 semanas) e instala o banco de questões.
- Quando o banco ganha questões novas (constante `BANK_VERSION` em `lib/bootstrap.ts`), elas são instaladas automaticamente na sua conta no próximo acesso, sem apagar o seu histórico.

## Banco de questões, plano e videoaulas

- `lib/math-drill.ts`: geradores do treino rápido de Matemática (27 tipos de exercício em 12 temas). `tests/drill.test.ts` gera milhares de exercícios e confere alternativas e respostas.
- `lib/bank/*.ts`: questões autorais por disciplina no formato `[tema, dificuldade, enunciado, alternativas, índice correto, explicação]`. As alternativas são embaralhadas de forma determinística (`lib/bank/index.ts`). `tests/bank.test.ts` confere 4 alternativas distintas, gabarito válido, temas do currículo e a distribuição das respostas.
- `lib/study-plan.ts`: objetivo e conceitos-chave de cada tema e a distribuição pelas 40 semanas.
- `lib/resources.ts`: 98 videoaulas (pelo menos 2 por tema) e 10 acervos oficiais (OBMEP, Portal da Matemática, Khan Academy, Saeb/Inep, OBA, ONHB, OBG, BNCC). Questão, plano e vídeo se ligam pelo nome do tema.
- `docs/plano-de-estudos-8ano.md`: plano completo com questões e gabarito comentado, pronto para imprimir. Gere de novo com `npm run docs:plano` depois de editar os dados.
- As questões de provas oficiais (OBMEP, Saeb, olimpíadas) **não são copiadas**: ficam nos sites de origem e aparecem como links. Os vídeos foram encontrados por busca na web; confira cada um antes de indicar em aula.
- Contas já existentes recebem as questões novas automaticamente no próximo login.

## Estrutura

```
app/page.tsx              cabeçalho e troca entre página pública e painel
components/painel/        seções do painel, página pública, voz e estado (useStudy)
app/api/auth              cadastro, login, logout, usuário atual
app/api/study             materiais, planos, temas, questões, tentativas
app/api/ai                tutor, leitura, geração, correção, sessões de estudo
app/api/file              upload e download (R2)
lib/ai.ts                 integração com a API Claude (Anthropic)
lib/auth.ts, password.ts  sessões e hash de senha (PBKDF2-SHA256)
lib/curriculum.ts         temas por disciplina
lib/question-bank.ts      banco inicial de questões
lib/resources.ts          catálogo de links externos
db/schema.ts, drizzle/    esquema e migrações do banco D1
tests/                    testes unitários
```

## Rodar localmente

Requisitos: Node.js 22.13+ e pnpm (`corepack enable`).

```sh
pnpm install
cp .dev.vars.example .dev.vars   # opcional: coloque sua ANTHROPIC_API_KEY
pnpm build                       # gera dist/ (necessário uma vez)
pnpm db:migrate:local            # cria as tabelas no banco local
pnpm dev                         # http://localhost:5173
```

Crie uma conta na tela inicial. Os dados locais ficam em `.wrangler/state` (ignorado pelo Git).

Verificações: `pnpm typecheck`, `pnpm lint`, `pnpm test`.

## Publicar na Cloudflare

1. Entre na conta: `npx wrangler login`.
2. Crie o banco e o bucket:
   ```sh
   npx wrangler d1 create painel-de-estudos
   npx wrangler r2 bucket create painel-de-estudos-arquivos
   ```
3. Copie o `database_id` exibido para `wrangler.jsonc`, no lugar de `00000000-0000-4000-8000-000000000000`.
4. Crie as tabelas no banco de produção: `pnpm db:migrate:remote`.
5. Cadastre a chave da IA como segredo (nunca no código): `npx wrangler secret put ANTHROPIC_API_KEY`.
6. Publique: `pnpm run deploy`. O endereço final aparece no terminal (`https://painel-de-estudos.<sua-conta>.workers.dev`).

Depois de mudar `db/schema.ts`: `pnpm db:generate` e aplique com `db:migrate:local` / `db:migrate:remote`.

### Variáveis

| Nome | Obrigatória | Uso |
|---|---|---|
| `ANTHROPIC_API_KEY` | para a IA | Chave da API Claude ([console.anthropic.com](https://console.anthropic.com/)). Segredo. |
| `ANTHROPIC_MODEL` | não | Modelo Claude. Padrão: `claude-opus-5`. |
| `ALLOW_SIGNUP` | não | `true` reabre o cadastro de novas contas (por padrão, fecha depois da primeira). |
| `ANTHROPIC_BASE_URL` | não | URL do [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/) para registro, cache e limites de gasto. |

## Custos e cuidados

- **IA:** cada pergunta, leitura, geração ou correção é cobrada por tokens pela Anthropic. O padrão, `claude-opus-5`, é o modelo de melhor qualidade (US$ 5 / US$ 25 por milhão de tokens de entrada/saída). Para gastar menos, use `ANTHROPIC_MODEL=claude-sonnet-5` (US$ 2 / US$ 10) ou `claude-haiku-4-5` (US$ 1 / US$ 5). Teste a qualidade das correções antes de trocar. Defina um limite de gasto no console da Anthropic ou no AI Gateway.
- **Cloudflare:** o uso de uma turma cabe, em geral, nos planos gratuitos de Workers, D1 e R2. Confira os limites atuais na Cloudflare.
- **Dados de menores (LGPD, art. 14):** o app guarda nome, e-mail, anotações, arquivos e respostas. O tratamento de dados de crianças e adolescentes deve ser feito no melhor interesse deles, com consentimento de um responsável quando exigido. Antes de abrir para uma escola, publique uma política de privacidade e defina quem administra os dados. Os textos enviados ao tutor e os arquivos lidos são processados pela Anthropic.
- **Segurança:** senhas com PBKDF2-SHA256 (100 mil iterações) e sal aleatório; sessão em cookie `HttpOnly`/`SameSite=Lax` (e `Secure` em HTTPS), com só o hash do token salvo no banco; bloqueio de 15 minutos após 8 senhas erradas; cada consulta filtra pelo dono dos dados. Ainda não há recuperação de senha por e-mail.
- **Conteúdo de terceiros:** o app só aponta para questões e vídeos externos, sem copiá-los. Confira a licença antes de incorporar material protegido.

## Origem

Projeto exportado da versão 4 do "Sites" (ChatGPT) e adaptado para funcionar sozinho: login próprio no lugar do login do ChatGPT, API Claude no lugar da OpenAI, voz pelo navegador e configuração de deploy padrão da Cloudflare. Veja `TRANSFERENCIA_CLAUDE.md`.
