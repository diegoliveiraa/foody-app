# Foody — front-end web (`foody-app`)

Foody é o app de delivery de um restaurante. O **cliente** busca no cardápio, monta a sacola, faz o
pedido e acompanha a entrega ao vivo, podendo cancelar ou pedir o cancelamento. A **equipe** recebe
os pedidos num quadro que se atualiza sozinho, avança cada um até a entrega, decide os pedidos de
cancelamento, mantém o catálogo e acompanha os indicadores. O **administrador** gerencia os
usuários e seus papéis. Este repositório é o front-end: React 19, Vite e TypeScript, com Tailwind e
shadcn/Radix, RTK Query, React Hook Form e Zod, testado com Vitest e Playwright.

A API (Java/Spring e PostgreSQL) fica no repositório irmão **`foody-api`** e precisa estar rodando:
lá também é um comando só. Cada repositório sobe sozinho — este não lê nada do outro para subir.

## Início rápido

### Pré-requisitos

- **Git**.
- **Docker** com Compose v2, em execução: no Windows e no macOS, o Docker Desktop aberto com o
  engine rodando; no Linux, o Docker Engine com o plugin `docker compose`. Node **não** é
  necessário.
- **Portas livres:** `5173` (este front) e `8080` (a API).
- **Navegador:** Chrome, Edge ou Firefox (o Safari não guarda a sessão em `http://localhost` — veja
  [Solução de problemas](#solução-de-problemas)).

### 1. Suba a API (repositório `foody-api`)

```bash
git clone https://github.com/diegoliveiraa/foody-api.git foody-api
cd foody-api
docker compose up -d --build --wait
```

Ela fica em `http://localhost:8080`, com dados de demonstração e as contas abaixo. Os detalhes
estão no README do `foody-api`.

### 2. Suba o front (este repositório)

```bash
git clone https://github.com/diegoliveiraa/foody-app.git foody-app
cd foody-app
docker compose up -d --build --wait
```

Abra **<http://localhost:5173>** — exatamente esse endereço (veja [CORS](#solução-de-problemas)).

- **Sem `.env` e sem Node:** o `compose.yaml` constrói a imagem de produção (o mesmo `Dockerfile`
  e o mesmo nginx do deploy) apontada para `http://localhost:8080` e a publica na porta 5173.
- **Primeira vez:** o Docker baixa as imagens base (Node 24 e nginx), instala as dependências e
  compila o app. Conte com 1 a 3 minutos, conforme a rede; com as imagens base já baixadas, o build
  levou 27 s nesta máquina. Das próximas vezes, poucos segundos.
- **Está pronto quando** o comando devolve o prompt depois de `Container foody-web-web-1 Healthy`:
  o `--wait` só termina quando o nginx já responde. `docker compose ps` mostra `(healthy)`.
- **Conferir pelo terminal:** `curl -I http://localhost:5173` (no PowerShell,
  `curl.exe -I http://localhost:5173`) responde `HTTP/1.1 200 OK` com um `Content-Security-Policy`
  que contém `connect-src 'self' http://localhost:8080`.

| Para… | Comando (nesta pasta) |
|---|---|
| parar e remover o container | `docker compose down` |
| subir de novo, sem mudanças | `docker compose up -d --wait` |
| reconstruir após mudar o código ou `VITE_API_URL` | `docker compose up -d --build --wait` |
| ver os logs do nginx | `docker compose logs -f web` |

**E se a API não estiver de pé?** O front abre normalmente, mas ao entrar aparece _"Não foi possível
falar com o servidor. Tente novamente."_ Suba a API (passo 1) e tente de novo — o front não
precisa ser reiniciado.

## Contas de demonstração

Todas com a senha **`Foody#2026`**:

| Papel | E-mail | Vê no menu |
|---|---|---|
| Cliente | `cliente@foody.local` | Loja: Cardápio, Pedidos |
| Equipe | `equipe@foody.local` | Dashboard, Pedidos, Catálogo (Produtos, Categorias) |
| Administrador | `admin@foody.local` | o mesmo da equipe, mais Administração → Usuários |

A navegação vem de `GET /me`: cada papel vê só as telas que a API libera. Uma tela fora do papel,
aberta pelo endereço, mostra _"Acesso negado"_.

## Roteiro de avaliação (5–10 min)

Use duas janelas lado a lado: uma normal para o **cliente** e uma anônima/privativa para a
**equipe** (cada janela precisa da sua própria sessão).

### Como cliente (`cliente@foody.local`)

1. **Cardápio** — digite em _"Buscar no cardápio"_: a busca filtra por nome, por palavra da
   descrição e pelo nome da categoria (experimente `pizzas` ou `lanches`). Os chips de
   _"Categorias"_ mostram uma categoria por vez.
2. **Sacola** — adicione itens (_"Adicionado à sacola: …"_) e abra _"Ver sacola"_: ajuste
   quantidades, remova itens e veja o total calculado pela API. _"Continuar"_ leva ao checkout.
3. **Finalizar pedido** — o endereço já vem preenchido com o do pedido anterior (_"Endereço do seu
   último pedido"_), e o CEP tem máscara. _"Fazer pedido"_ → _"Pedido #N enviado ao restaurante"_,
   e o acompanhamento abre.
4. **Acompanhamento ao vivo** — a linha do tempo marca cada etapa com o horário e _"Atualiza
   sozinho"_ (a cada 30 s). Deixe essa tela aberta e avance o pedido na janela da equipe.
5. **Cancelar** — enquanto o pedido está _"Recebido"_, _"Cancelar pedido"_ pede um motivo e cancela
   na hora. Já _"Em preparo"_, o botão vira _"Solicitar cancelamento"_ → _"Enviar solicitação"_, e
   o restaurante decide.
6. **Pedidos** (menu) — a lista dos seus pedidos, do mais novo para o mais antigo, com _"Ver mais
   pedidos"_ e o aviso _"Solicitação enviada. Avisaremos a resposta."_ nos que aguardam decisão.

### Como equipe (`equipe@foody.local`, na janela anônima)

1. **Pedido novo** — com a equipe em qualquer tela, faça um pedido como cliente: em até 30 s surge o
   aviso _"Novo pedido #N recebido"_ e o contador ao lado de **Pedidos** no menu lateral (_"N
   pedidos ativos"_) sobe.
2. **Quadro de pedidos** — no desktop, três colunas: _"Recebidos"_, _"Em preparo"_ e _"Saiu para
   entrega"_. Abaixo de 1024 px, as colunas viram abas (_"Recebidos"_, _"Em preparo"_,
   _"Saindo"_). Avance um pedido com _"Iniciar preparo"_ → _"Saiu para entrega"_ → _"Marcar
   entregue"_ e veja a linha do tempo mudar na janela do cliente.
3. **Pedidos de cancelamento** — os dados de demonstração trazem pedidos em preparo com
   solicitação pendente: o aviso _"N solicitações de cancelamento aguardando você"_ e o selo
   _"Cliente pediu cancelamento"_ levam a _"Ver solicitação"_. _"Aprovar"_ cancela o pedido;
   _"Recusar"_ o mantém em preparo. Nos dois casos dá para deixar uma observação ao cliente.
4. **Histórico** — a aba _"Histórico"_ busca por número ou cliente, filtra por status e por
   período (_"De"_ / _"Até"_), ordena (mais recentes, maior total, número…) e pagina com 10, 25,
   50 ou 100 itens. Abaixo de 1024 px a tabela vira cartões, com _"Ordenar por"_.
5. **Dashboard** — alterne _"Hoje"_, _"7 dias"_ e _"30 dias"_: pedidos, faturamento, ticket médio
   e cancelamentos contra o período anterior, pedidos por hora/dia, tempo médio por etapa, mais
   vendidos e motivos de cancelamento.
6. **Catálogo** — em **Produtos** e **Categorias**: _"Novo produto"_ / _"Nova categoria"_,
   _"Editar"_, _"Desabilitar"_ / _"Habilitar"_ e _"Excluir"_. Tente excluir um produto que já foi
   pedido, ou uma categoria com produtos: a API recusa (_"O produto já aparece em pedidos;
   desabilite-o em vez de excluir"_), o diálogo mostra esse motivo e oferece _"Desabilitar em vez
   disso"_ — o item sai do cardápio sem apagar o histórico.

### Como administrador (`admin@foody.local`)

1. Na janela anônima, saia e crie uma conta nova em _"Criar conta"_ — assim as contas de
   demonstração ficam intactas. Deixe essa sessão aberta.
2. Na janela normal, entre como admin e abra **Usuários**: busque por nome ou e-mail, filtre por
   papel e status, ordene e pagine.
3. **Alterar papel** da conta nova (por exemplo, para _"Equipe"_) → _"Papel alterado: … agora é
   Equipe"_.
4. **Desabilitar** a conta nova: _"… perde o acesso imediatamente e a sessão é encerrada."_ Na
   janela anônima, a próxima ação que fala com a API (abrir **Pedidos**, por exemplo) leva ao login
   com _"Sua sessão terminou. Entre novamente."_ — e a conta não entra mais. _"Habilitar"_ devolve o
   acesso.

### Responsividade

Abra o DevTools no modo de dispositivo (`Ctrl+Shift+M` no Chrome/Edge/Firefox; `Cmd+Shift+M` no
macOS) e passe por 320, 768, 1280 e 1536 px: nada transborda na horizontal. Abaixo de 768 px a loja
navega por uma barra de abas no rodapé e o menu lateral da equipe vira o botão _"Abrir menu"_;
abaixo de 1024 px as listas viram cartões (com _"Ordenar por"_) e o quadro de pedidos vira abas.

## Para desenvolver

Requer **Node 24** e npm.

```bash
npm ci
npm run dev
```

O Vite sobe em <http://localhost:5173> com recarga instantânea, apontando para a API em
`http://localhost:8080` — **não precisa de `.env`**. Para usar outra API, copie `.env.example` para
`.env` e mude `VITE_API_URL` (ou exporte a variável), e reinicie o `npm run dev`. A porta 5173 é a
mesma do container: rode `docker compose down` antes.

Quando o contrato da API mudar, regenere os tipos a partir do OpenAPI do `foody-api` (que precisa
estar clonado ao lado, em `../foody-api`) e versione o arquivo gerado junto com a mudança:

```bash
npm run api:types
```

## Testes e qualidade

| Comando | O que faz |
|---|---|
| `npx tsc -b` | checagem de tipos (não use `tsc --noEmit`: o `tsconfig.json` raiz não compila nada) |
| `npm run lint` | oxlint com regras que usam os tipos; falha com qualquer aviso |
| `npm run format:check` | Prettier (`npm run format` corrige) |
| `npm run check:comments` | garante zero comentários no código (script bash; no Windows, rode pelo Git Bash) |
| `npm test` | **testes unitários** (Vitest + Testing Library; a rede é simulada com MSW) |
| `npm run e2e` | **E2E** com a API simulada, em 320, 768, 1280 e 1536 px; sobe o próprio Vite na porta 4173 |
| `npm run e2e:integrated` | **fluxos críticos contra a API real** (login, catálogo e cardápio, ciclo do pedido, quadro, dashboard, usuários); sobe o próprio Vite na porta 4174 |
| `npm run build` | type-check e build de produção em `dist/` |

Os navegadores do Playwright são instalados uma vez:

```bash
npx playwright install chromium
```

No Linux, use `npx playwright install --with-deps chromium` para trazer também as bibliotecas do
sistema.

**Suíte integrada:** precisa da pilha de demonstração da API no ar (passo 1 do início rápido; ela
aceita a origem `http://localhost:4174` no CORS) e entra com as contas de demonstração — sem
configuração. Para usar outras contas, defina `SEED_CUSTOMER_EMAIL`, `SEED_STAFF_EMAIL`,
`SEED_DEFAULT_PASSWORD`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`; cada uma que estiver definida
substitui a de demonstração. Por exemplo, contra a API rodando com `./mvnw spring-boot:test-run`:

```bash
set -a; . ../foody-api/.env; set +a
npm run e2e:integrated
```

No PowerShell, defina cada variável antes (`$env:SEED_ADMIN_EMAIL = "admin@exemplo.com"`) e rode
`npm run e2e:integrated`. A suíte grava na API (o teste de usuários cadastra um cliente novo a cada
execução), então rode só contra uma API local.

Números atuais: **615 testes unitários** em 113 arquivos; **218 testes E2E** em 70 specs, rodados
em cada uma das 4 larguras (872 execuções, das quais 47 são puladas de propósito onde o layout
testado não existe naquela largura); e **32 testes integrados** em 6 specs.

**CI** (`.github/workflows/ci.yml`): tipos, lint, formatação, comentários, testes unitários e build;
a imagem de produção sobe saudável via `compose.deploy.yaml`; a demo sobe com
`docker compose up -d --build --wait` e `/`, `/login` e `/menu` respondem 200 com a
Content-Security-Policy; e a suíte E2E roda nas quatro larguras. A suíte integrada roda localmente
(ADR-0016).

## Imagem de produção

`compose.deploy.yaml` é o arquivo de produção: só o container web, com sistema de arquivos somente
leitura, `no-new-privileges`, limite de memória e health check.

```bash
VITE_API_URL=https://api.exemplo.com docker compose -f compose.deploy.yaml up -d --build
```

No PowerShell, `$env:VITE_API_URL = "https://api.exemplo.com"` e depois
`docker compose -f compose.deploy.yaml up -d --build`. Também dá para deixar as variáveis num `.env`
no servidor.

- `VITE_API_URL` é **obrigatória** e entra no build: o build falha sem ela. Uma imagem por URL de
  API — mudou a URL, reconstrua.
- O nginx não roda como root e escuta na porta 8080 do container; a porta publicada é `WEB_PORT`
  (padrão 80).
- A **Content-Security-Policy é gerada no build**: o `Dockerfile` extrai a origem de `VITE_API_URL`
  e a escreve em `connect-src` a partir do `nginx.conf.template` (ADR-0017). Rotas desconhecidas
  devolvem o `index.html` (SPA); arquivos em `/assets/` têm cache de um ano.
- Sem Compose: `docker build --build-arg VITE_API_URL=https://api.exemplo.com -t foody-app .`

## Organização do código

```text
src/
  pages/<área>/<tela>/   uma pasta por tela: store (cardápio, checkout, meus pedidos), orders
                         (quadro, histórico, detalhe), catalog, dashboard, admin, auth, errors
  components/ui/         primitivos shadcn/Radix
  components/<nome>/     componentes compartilhados (data-table, responsive-list, list-pagination…)
  services/              RTK Query: api.ts (token em memória e refresh), um arquivo por domínio,
                         schemas Zod em validation-schemas/
  routes/                o roteador e os guards (sessão e acesso a partir de GET /me)
  store/                 Redux: sessão, sacola e listeners
  @types/                tipos da API, gerados do OpenAPI (api.d.ts)
  constants/ hooks/ utils/
e2e/
  tests/                 specs com a API simulada, em todas as larguras
  integrated/            fluxos críticos contra a API real
  support/               fixtures, stubs e as contas de demonstração
docs/adr/                as decisões de arquitetura, ADR-0001 a ADR-0027
CLAUDE.md                as regras do repositório (fonte única)
```

Cada decisão de arquitetura tem um ADR em [`docs/adr/`](./docs/adr/README.md), com o porquê, as
alternativas e os contras. As regras de código e de organização ficam em
[`CLAUDE.md`](./CLAUDE.md).

## Variáveis de ambiente

Nenhuma é necessária para o início rápido nem para `npm run dev`.

| Variável | Usada por | Padrão | Para quê |
|---|---|---|---|
| `VITE_API_URL` | `npm run dev`, `npm run build`, `compose.yaml`, `compose.deploy.yaml` | `http://localhost:8080` (obrigatória no deploy) | URL base da API; entra no build e na CSP |
| `WEB_PORT` | `compose.yaml` / `compose.deploy.yaml` | `5173` / `80` | porta publicada no host |
| `FOODY_APP_IMAGE` | `compose.deploy.yaml` | `foody-app:latest` | nome da imagem |
| `WEB_MEMORY_LIMIT` | `compose.deploy.yaml` | `64M` | limite de memória do container |
| `SEED_CUSTOMER_EMAIL`, `SEED_STAFF_EMAIL`, `SEED_DEFAULT_PASSWORD`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | `npm run e2e:integrated` | as contas de demonstração | contas usadas pela suíte integrada |

O Docker Compose lê um `.env` nesta pasta: um `WEB_PORT` ali vale para os dois arquivos de compose.

## Solução de problemas

- **"Não foi possível falar com o servidor. Tente novamente."** — a API não está no ar. Rode
  `docker compose up -d --build --wait` no `foody-api` e confira
  <http://localhost:8080/actuator/health> (`{"status":"UP"}`).
- **CORS** — a API só aceita o front em `http://localhost:5173`. Abra exatamente esse endereço:
  `http://127.0.0.1:5173` ou outra porta são outra origem, e o navegador bloqueia as chamadas (o
  console do DevTools mostra o erro de CORS, e a tela mostra a mensagem acima).
- **Safari / WebKit** — a sessão é renovada por um cookie `Secure`, e o Safari não o guarda em
  `http://localhost`: o login funciona, mas a sessão some ao recarregar. Use Chrome, Edge ou
  Firefox.
- **Porta 5173 ocupada** — em geral é um `npm run dev` esquecido, ou o container já está de pé.
  Descubra quem usa: `lsof -i :5173` (macOS/Linux) ou `Get-NetTCPConnection -LocalPort 5173` no
  PowerShell. Dá para publicar em outra porta (`WEB_PORT=5174 docker compose up -d --wait`; no
  PowerShell, `$env:WEB_PORT = "5174"` antes), mas a API precisa aceitar essa origem no CORS.
- **Mudei `VITE_API_URL` e nada mudou** — variáveis `VITE_*` entram no build: reinicie o
  `npm run dev` ou rode `docker compose up -d --build --wait`. Recarregar a página não basta.
- **Playwright: "Executable doesn't exist"** — faltam os navegadores:
  `npx playwright install chromium` (no Linux, com `--with-deps`).
- **Docker: "Cannot connect to the Docker daemon"** ou erro de `dockerDesktopLinuxEngine` no Windows
  — o Docker não está rodando: abra o Docker Desktop e espere o engine iniciar.
