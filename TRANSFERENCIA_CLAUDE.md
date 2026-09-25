# Painel de Estudos — transferência para Claude Cowork

Este pacote contém o código-fonte completo da versão 4 salva do site. A versão 4 ainda não foi publicada; a versão ao vivo é anterior. O pacote não contém o banco de dados de produção, arquivos enviados pelos usuários, dependências instaladas ou chaves de API.

## Funcionalidades
- Interface em português para organização de estudos do 8º ano, inspirada nas imagens fornecidas pelo usuário.
- Banco inicial de 46 questões autorais, com gabarito e explicação em `lib/question-bank.ts`.
- Trilhas semanais em `lib/curriculum.ts`, catálogo de links para OBMEP, Khan Academy e aulas no YouTube em `lib/resources.ts`.
- Planos, tópicos, exercícios, tentativas e recursos em D1/SQLite (`db/schema.ts`, `drizzle/`). O catálogo e o banco inicial são carregados após login pela aplicação.
- Chat com tutor, extração de texto/conceitos de PDF e imagem, geração de exercícios, correção semântica e voz. A IA depende de uma chave OpenAI configurada no servidor.
- Uploads em R2, autenticação do Sites via cabeçalho de usuário autenticado.

## Estrutura
`app/page.tsx` é a interface; `app/api/study`, `ai`, `audio` e `file` são as rotas; `db/` e `drizzle/` definem o banco; `lib/` contém currículo, questões, recursos e integração de IA. `public/` contém os recursos estáticos. O `README.md` original explica instalação e execução do starter Sites/Vinext.

## Para abrir e adaptar
1. Extraia o ZIP e abra a pasta `painel-de-estudos` no Cowork.
2. Use Node.js >= 22.13.0 e instale as dependências do projeto (`npm run install:ci`, conforme o README original).
3. Configure runtime Cloudflare Workers compatível com Vinext, D1 binding `DB` e R2 binding `BUCKET` (veja `.openai/hosting.json`, `vite.config.ts` e `cloudflare-env.d.ts`). Se migrar para outra hospedagem, substitua as integrações `cloudflare:workers`, D1, R2 e a autenticação do Sites.
4. Aplique as migrações SQL `drizzle/0000_...`, `0001_...`, `0002_...` nesta ordem a uma base nova; faça backup antes de qualquer migração de uma base existente.
5. Configure `OPENAI_API_KEY` como segredo apenas no servidor. Nunca inclua a chave em código-fonte, arquivo público ou mensagens. Os modelos e endpoints estão em `lib/ai.ts` e `app/api/audio/route.ts`.
6. Execute `npm run build`. Para testes locais veja as instruções do README original sobre perfil e simulação de login.

## Limites importantes
- Não há cópia das questões de terceiros: o site apenas referencia repositórios externos; as 46 perguntas são autorais.
- As videoaulas específicas estão concentradas em Matemática; em outras disciplinas a cobertura é parcial.
- A correção semântica, leitura automática, voz e geração exigem uma chave válida e custos de API. Sem chave, o site exibe indisponibilidade dessas funções. Correção literal existe como alternativa limitada.
- Dados reais dos usuários e objetos enviados estão no serviço hospedado; não acompanham esta exportação. Para migração completa de dados, faça exportações separadas de D1 e R2 com autorização adequada.
- Não incorpore material externo protegido ao novo projeto sem conferir a licença; mantenha os links e atribuições das fontes.

## Fontes públicas vinculadas
- OBMEP, banco: https://www.obmep.org.br/banco.htm
- OBMEP, provas e soluções: https://www.obmep.org.br/provas.htm
- Khan Academy, Matemática do 8º ano: https://pt.khanacademy.org/math/pt-8-ano
- BNCC: https://basenacionalcomum.mec.gov.br/
- IDs e URLs das aulas: `lib/resources.ts`.
