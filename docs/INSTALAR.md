# Como instalar o Painel de Estudos no computador e no celular do estudante

O app é um **aplicativo web instalável** (PWA): ele ganha ícone na tela inicial, abre em tela cheia, funciona **sem internet** e **não precisa de conta**. O progresso fica salvo no próprio aparelho.

Você publica uma única vez (grátis) e envia o link para o estudante. Quem instala é o estudante, no aparelho dele.

## Parte 1: publicar (quem cuida do app faz uma vez, no próprio computador)

Arquivo a usar: **`painel-de-estudos-app.zip`** (na pasta `standalone/` do repositório, ou o arquivo enviado na conversa).

1. Crie uma conta gratuita em <https://app.netlify.com/signup> (pode entrar com Google).
2. Abra <https://app.netlify.com/drop>.
3. Arraste o arquivo `painel-de-estudos-app.zip` para a área indicada.
4. Em poucos segundos aparece o endereço do site, algo como `https://nome-aleatorio.netlify.app`.
5. (Opcional) Em **Site configuration → Change site name**, troque para um nome fácil, por exemplo `estudos-da-ana`, e o endereço fica `https://estudos-da-ana.netlify.app`.
6. Envie o endereço para o estudante por WhatsApp ou e-mail.

> Sem conta, o Netlify apaga o site em 24 horas. Por isso crie a conta antes (passo 1).
>
> Alternativa: Cloudflare Pages (**Workers & Pages → Create → Pages → Use direct upload**, com conta gratuita), arrastando o mesmo `.zip`.

**Para atualizar o app depois** (por exemplo, com questões novas): gere o zip de novo (`npm run build:standalone`), abra o site no Netlify, vá em **Deploys** e arraste o novo zip. Os estudantes recebem a versão nova na próxima vez que abrirem o app com internet. O progresso deles não se perde.

## Parte 2: instalar (o estudante faz em cada aparelho)

### Celular Android (Chrome)
1. Abra o link no **Chrome**.
2. Toque em **Instalar** no aviso que aparece embaixo, ou no menu **⋮ → Instalar app** (em algumas versões: **Adicionar à tela inicial**).
3. O ícone **Estudos** (Σ) aparece na tela inicial.

### iPhone ou iPad (Safari)
1. Abra o link no **Safari** (precisa ser o Safari).
2. Toque no botão **Compartilhar** (quadrado com seta para cima).
3. Toque em **Adicionar à Tela de Início** e depois em **Adicionar**.

### Computador (Chrome ou Edge; Windows, Mac ou Chromebook)
1. Abra o link no **Chrome** ou no **Edge**.
2. Clique no ícone **Instalar** na barra de endereço (monitor com seta), ou no menu **⋮ → Transmitir, salvar e compartilhar → Instalar página como app** (Chrome) / **… → Aplicativos → Instalar este site como aplicativo** (Edge).
3. O app aparece no menu Iniciar / Launchpad e pode ser fixado na barra de tarefas.

Depois de aberto uma vez com internet, o app funciona também **sem internet**. Só os links de videoaula precisam de internet.

## Parte 3: levar o progresso de um aparelho para o outro

Cada aparelho guarda o próprio progresso. Para juntar:

1. No aparelho com o progresso, abra **Matemática** (ou **Plano**) e role até **Levar o progresso para outro aparelho**.
2. Toque em **Gerar e copiar código** e envie o código para você mesmo (WhatsApp, e-mail).
3. No outro aparelho, abra o mesmo quadro, cole o código em **Restaurar** e toque em **Restaurar / juntar progresso**.

Os dois progressos são somados; nada é apagado.

## Cuidados

- **Não limpe os dados do site** no navegador (isso apaga o progresso do aparelho). Faça uma cópia pelo código de vez em quando.
- O app não coleta nenhum dado: nada sai do aparelho, a não ser quando o estudante abre um link de videoaula.
- O **tutor com IA** e o botão **Explicar passo a passo** só aparecem na versão aberta dentro do Claude. No app instalado, as explicações do gabarito continuam disponíveis em todas as questões.
