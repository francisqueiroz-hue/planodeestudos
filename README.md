# Painel de Estudos · 8º ano

Aplicação web para organizar os estudos do 8º ano do Ensino Fundamental: plano por temas, banco de questões com gabarito, tutor com IA (Claude), leitura de PDFs e fotos, e controle do tempo de estudo.

Roda na Cloudflare (Workers + banco D1 + armazenamento R2), com [vinext](https://github.com/cloudflare/vinext) (Next.js App Router sobre Vite).

## Funcionalidades

| Área | O que faz |
|---|---|
| **Conta** | Cadastro e login com e-mail e senha. Cada estudante vê só os próprios dados. |
| **Visão geral** | Materiais, temas revisados, % de acertos, cronômetro de estudo e gráfico dos últimos 7 dias. |
| **Materiais** | Upload de PDF, PNG, JPG ou TXT (até 15 MB) e anotações. Com IA, o arquivo (até 8 MB) é transcrito e organizado por tópicos. |
| **Plano de estudos** | Trilhas guiadas por disciplina (currículo do 8º ano) ou plano próprio. Com data da prova, os temas são distribuídos em semanas. Links para videoaulas públicas (OBMEP/IMPA, Khan Academy, Canal Futura). |
| **Questões** | 46 questões autorais com gabarito e explicação, questões manuais, geração de 5 questões por tema com IA, modos Quiz e Flashcards. Correção por significado com IA; sem IA, correção literal (ignora acentos e maiúsculas). |
| **Tutor de IA** | Chat passo a passo, que pode usar um material já lido como contexto. Ditado por voz e leitura em voz alta pelo próprio navegador (sem custo). |

Sem chave de IA, o app funciona normalmente e apenas desativa tutor, leitura de arquivos, geração e correção por significado.

## Estrutura

```
app/page.tsx              interface (login + painel)
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
| `ANTHROPIC_BASE_URL` | não | URL do [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/) para registro, cache e limites de gasto. |

## Custos e cuidados

- **IA:** cada pergunta, leitura, geração ou correção é cobrada por tokens pela Anthropic. O padrão, `claude-opus-5`, é o modelo de melhor qualidade (US$ 5 / US$ 25 por milhão de tokens de entrada/saída). Para gastar menos, use `ANTHROPIC_MODEL=claude-sonnet-5` (US$ 2 / US$ 10) ou `claude-haiku-4-5` (US$ 1 / US$ 5). Teste a qualidade das correções antes de trocar. Defina um limite de gasto no console da Anthropic ou no AI Gateway.
- **Cloudflare:** o uso de uma turma cabe, em geral, nos planos gratuitos de Workers, D1 e R2. Confira os limites atuais na Cloudflare.
- **Dados de menores (LGPD, art. 14):** o app guarda nome, e-mail, anotações, arquivos e respostas. O tratamento de dados de crianças e adolescentes deve ser feito no melhor interesse deles, com consentimento de um responsável quando exigido. Antes de abrir para uma escola, publique uma política de privacidade e defina quem administra os dados. Os textos enviados ao tutor e os arquivos lidos são processados pela Anthropic.
- **Segurança:** senhas com PBKDF2-SHA256 (100 mil iterações) e sal aleatório; sessão em cookie `HttpOnly`/`SameSite=Lax` (e `Secure` em HTTPS), com só o hash do token salvo no banco; bloqueio de 15 minutos após 8 senhas erradas; cada consulta filtra pelo dono dos dados. Ainda não há recuperação de senha por e-mail.
- **Conteúdo de terceiros:** o app só aponta para questões e vídeos externos, sem copiá-los. Confira a licença antes de incorporar material protegido.

## Origem

Projeto exportado da versão 4 do "Sites" (ChatGPT) e adaptado para funcionar sozinho: login próprio no lugar do login do ChatGPT, API Claude no lugar da OpenAI, voz pelo navegador e configuração de deploy padrão da Cloudflare. Veja `TRANSFERENCIA_CLAUDE.md`.
