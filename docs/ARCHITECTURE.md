# Arquitetura — CRM Dashboard

Descrição da arquitetura **implementada** hoje. Regras de trabalho para o Claude Code e para o time estão em [CLAUDE.md](CLAUDE.md) (seção 4); padrões visuais, em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md). Se o código mudar, este documento muda junto.

---

## 1. Visão geral

- SPA em **Angular 22.2** (`@angular/core` 22.2.x), com componentes **standalone**, **signals** e `inject()`.
- Estilos com **Tailwind CSS 4** configurado em CSS (`@theme` em `src/styles.css`).
- Dados **somente mockados** (`core/mocks/mock-data.ts`). Não há backend nem `HttpClient`.
- Idioma da interface: `pt-BR`.

### Telas e rotas

| Caminho         | Tela                                                                                | Proteção                     | Carregamento |
| --------------- | ----------------------------------------------------------------------------------- | ---------------------------- | ------------ |
| `/login`        | `AuthPage`                                                                          | `guestGuard` (só visitantes) | lazy         |
| `/home`         | `HomePage` (visão geral de projetos e tarefas)                                      | `authGuard` (só logados)     | lazy         |
| `/projetos`     | `ProjectListPage` (grid de projetos agrupados por equipe; item Projetos da sidebar) | `authGuard` (só logados)     | lazy         |
| `/projetos/:id` | `ProjectDetailPage` (página de um projeto; aberta pela lista de projetos da home)   | `authGuard` (só logados)     | lazy         |
| `/`             | redireciona para `/home`                                                            | —                            | —            |
| `**`            | redireciona para `/home`                                                            | —                            | —            |

Não existe rota de cadastro. O botão "Cadastrar" da tela de login abre um painel lateral com o formulário de cadastro (ver seção 4.3). O envio ao servidor ainda não existe.

---

## 2. Estrutura de diretórios

```text
src/
├── main.ts                     # bootstrap da aplicação (App + appConfig)
├── styles.css                  # Tailwind e tokens do design system (@theme)
├── index.html                  # lang="pt-BR"; fonte variável do Material Symbols, só com os ícones usados (icon_names)
└── app/
    ├── app.ts / app.html / app.css   # shell: <router-outlet /> e o botão de tema fixo (canto superior direito, todas as telas)
    ├── app.config.ts           # providers globais: router, locale pt-BR, listeners de erro
    ├── app.routes.ts           # compõe as rotas de cada feature
    ├── app.routes.spec.ts      # fixa caminhos, guards e redirecionamentos
    ├── app.spec.ts
    ├── core/                   # infraestrutura singleton, sem UI
    │   ├── guards/             # authGuard, guestGuard (funcionais)
    │   ├── services/           # AuthService, ProjectDataService, CrmDataService (sem uso na tela hoje), ThemeService (tema escuro/claro)
    │   ├── models/             # tipos de domínio: project.models.ts (projetos, tarefas, equipe) e crm.models.ts (User e tipos de CRM)
    │   └── mocks/              # dados mockados (mock-data.ts)
    ├── shared/                 # componentes visuais reutilizáveis, sem regra de negócio
    │   ├── index.ts            # ponto de entrada: import { Button, Input } from '…/shared'
    │   ├── components/         # button, card, checkbox, field-message, form-panel, icon, input, modal, select, sidebar, skeleton, text-link, textarea
    │   ├── forms/              # ControlValueBase (contrato dos campos de formulário)
    │   ├── motion/             # animateElement e prefersReducedMotion (animações que respeitam movimento reduzido)
    │   └── styles/             # field.styles.ts (classes base e estados dos campos)
    └── features/               # funcionalidades por domínio
        ├── auth/
        │   ├── auth.routes.ts  # rotas de autenticação (AUTH_ROUTES)
        │   ├── pages/auth-page/    # auth-page.ts, auth-page.html, auth-page.spec.ts
        │   └── components/
        │       ├── city-scene/
        │       │   ├── city-scene.ts / .html / .spec.ts   # componente 3D: ciclo de vida e troca de vista
        │       │   ├── scene-factory.ts / .spec.ts        # montagem, animação dos cubos e liberação da cena Three.js
        │       │   └── seeded-random.ts / .spec.ts        # gerador pseudoaleatório determinístico
        │       └── auth-form/                             # formulário do painel lateral: cadastro ou entrada (app-form-panel)
        ├── home/
            ├── home.routes.ts  # rotas privadas da visão geral (HOME_ROUTES)
            ├── dashboard-stats.ts / .spec.ts          # indicadores, quadro, andamento dos projetos e carga da equipe (funções puras)
            ├── components/task-board/                 # quadro de tarefas em colunas; arrastar ou ←/→ emite taskMoved; clique/Enter emite taskOpened
            ├── components/task-card/                  # conteúdo de um cartão de tarefa
            ├── components/task-details/               # detalhes da tarefa (descrição completa), exibidos no app-modal da home
            ├── components/task-comments/              # comentários da tarefa (lista + campo); emite commentSubmitted, a home grava via ProjectDataService
            └── pages/home-page/  # home-page.ts, home-page.html, home-page.spec.ts
        └── projects/
            ├── projects.routes.ts  # rotas privadas /projetos e /projetos/:id (PROJECTS_ROUTES)
            ├── project-progress.ts # função pura projectProgress (tarefas concluídas / total)
            ├── project-list.ts     # função pura buildProjectGroups (projetos por equipe)
            ├── project-detail.ts   # função pura buildProjectDetail (líder, andamento, tarefas)
            ├── pages/project-list-page/    # ProjectListPage: grid de projetos por equipe
            └── pages/project-detail-page/  # ProjectDetailPage: dados do projeto e lista de tarefas
```

Não existem `interceptors/`, `directives/`, `pipes/` nem `environments/`. Eles entram quando houver uso real (ver seção 8).

---

## 3. Responsabilidades por camada

| Camada          | Pode importar de                       | Responsabilidade                                          | Não deve conter                               |
| --------------- | -------------------------------------- | --------------------------------------------------------- | --------------------------------------------- |
| `core/`         | `core/`                                | Serviços singleton, guards, modelos, mocks                | Componentes, estilos                          |
| `shared/`       | `shared/`                              | Componentes visuais, contratos de campo, classes de campo | Regras de negócio, chamadas a serviços, rotas |
| `features/<x>/` | `core/`, `shared/` e a própria feature | Páginas, componentes da feature, rotas, cálculos de tela  | Importar internos de outra feature            |
| `app/` (raiz)   | `core/`, `features/`                   | Shell, configuração global, composição das rotas          | Lógica de tela                                |

Regras de dependência:

- `shared/` não importa de `core/` nem de `features/`. Hoje nenhum componente compartilhado depende de dados.
- `core/` não importa de `features/`.
- Uma feature não importa componentes ou arquivos internos de outra feature. Se duas features precisarem do mesmo elemento visual, ele vai para `shared/`; se precisarem dos mesmos dados, vai para `core/`.

---

## 4. Fluxos

### 4.1 Layout da área logada e dados (visão geral)

O app é um gestor de projetos e atividades do time. A home (`/home`) é a visão geral: indicadores no topo, quadro de tarefas (A fazer, Em andamento, Em revisão, Concluídas) e, à direita, andamento dos projetos e carga de trabalho da equipe.

- **Tela cheia:** a home não tem largura máxima. Ocupa toda a largura ao lado da sidebar (folga interna de `16px`, `24px` em `md` e `32px` em `lg`) e, a partir de `lg`, exatamente a altura da janela (`h-dvh`): o quadro, a lista de projetos e a lista da equipe rolam por dentro (`app-card` com `fill`). Abaixo de `lg`, as áreas empilham e a página rola normalmente. O quadro ocupa 2/3 da largura em `lg` e 3/4 em `xl`; sem largura para as 4 colunas, ele rola na horizontal dentro do card.
- Áreas roláveis são `relative` (para os textos `sr-only`, que são `absolute`, não escaparem do recorte e criarem rolagem na página) e focáveis (`tabindex="0"`, com nome acessível) para rolar pelo teclado.
- Carregamento: a home usa `toSignal` sem valor inicial. Enquanto alguma resposta é `undefined`, mostra `app-skeleton` no formato dos indicadores, das colunas e das listas (`role="status"`). Listas vazias são respostas válidas e mostram estado vazio ("Nenhuma tarefa", "Nenhum projeto cadastrado.", "Nenhum membro na equipe.").
- Datas: prazos e atrasos são calculados em relação a `today`, fixado quando a tela abre e passado às funções puras (que não leem o relógio).

- Não há barra de navegação no topo. A navegação é a `app-sidebar` (shared): flutuante à esquerda (`fixed`, separada das bordas por `16px`, cantos `rounded-2xl`), recolhida em `64px` só com ícones e expandida em `240px` pelo botão do topo. O host `app-sidebar` reserva no layout a largura ocupada (`80px` recolhida, `256px` expandida, animando junto): numa página em `flex`, expandir **empurra** o conteúdo. Abaixo de `md`, o espaço reservado fica o da recolhida e a expandida passa por cima, para não espremer o conteúdo no celular. Ela traz os itens, o usuário e o botão Sair (`logout`).
- A home declara os itens (`NAV_ITEMS`: Visão geral, Projetos, Tarefas, Calendário, Equipe, Relatórios, Configurações) e monta a página em `flex`: `<app-sidebar>` seguido de `<main class="min-w-0 flex-1 pl-4 …">`. Hoje a sidebar só existe na home; quando houver mais telas logadas, ela deve ir para um layout compartilhado.

```text
HomePage (página)
  └─ ProjectDataService.getProjects() / getTasks() / getTeam()   Observable (core/services)
       └─ mock-data.ts                                          (latência simulada de 300 ms)
  └─ toSignal(...)                                              sinais de estado
  └─ computed(...)          funções puras em features/home/dashboard-stats.ts
       ├─ buildDashboardStats(...)     indicadores
       ├─ buildTaskBoard(...)          colunas do quadro → <app-task-board>
       ├─ buildProjectSummaries(...)   andamento por projeto
       └─ buildTeamWorkload(...)       tarefas abertas e atrasadas por membro
  └─ (taskMoved) do quadro → moveTask(...) atualiza o linkedSignal de tarefas (só na tela; sem persistência)
```

O componente só orquestra: recebe os sinais, pede as derivações e renderiza. As regras (indicadores, agrupamento do quadro, andamento e carga) estão em `dashboard-stats.ts`, testadas sem Angular.

### 4.2 Autenticação

- `AuthService` guarda o usuário logado em um `signal` e o expõe como `currentUser` (somente leitura) e `isLoggedIn` (`computed`).
- `login(email, password)` retorna um `Observable<User>`: simula uma chamada HTTP com 600 ms de espera. Em caso de falha, emite um `Error` cuja mensagem é exibida ao usuário.
- A sessão vai para o `localStorage` na chave `AUTH_STORAGE_KEY` (`crm.currentUser`). É um protótipo: não há token nem validação no servidor.
- `authGuard` e `guestGuard` leem `isLoggedIn` e devolvem `true` ou um `UrlTree` de redirecionamento. **Não são controle de segurança** (ver [CLAUDE.md](CLAUDE.md), seção 7).

### 4.3 AuthPage, cenário 3D e painel de autenticação

```text
AuthPage (página, lazy)
  ├─ <app-city-scene>  (features/auth/components/city-scene)
  │    ngAfterViewInit → fora da zona do Angular → start()
  │      ├─ sem WebGL: não desenha nada (o fundo preto continua)
  │      ├─ perfil DESKTOP ou MOBILE (largura < 768 px)
  │      ├─ createScene(profile)       → scene-factory.ts
  │      ├─ movimento reduzido: um quadro estático
  │      └─ senão: loop de animação, pausado com a aba oculta
  │    setView("side" | "aerial")      → transição suave entre a vista de cima e a lateral
  │    ngOnDestroy → para o loop, remove listeners, disposeScene, renderer.dispose()
  ├─ tema: vem do ThemeService (botão fixo no shell); a página troca classes e chama cityScene.setTheme
  ├─ frase (rola ao mudar), botão "Cadastrar" (primary) e botão "Entrar" (outline no escuro, secondary no claro)
  ├─ panelMode: "register" | "login" | null (null = painel fechado)
  │    Cadastrar → openRegister(): panelMode "register", setView("side"), frase de cadastro
  │    Entrar    → openLogin():    panelMode "login",    setView("side"), frase inicial
  │    com o painel aberto, o outro botão troca o modo sem fechar o painel
  │    fechar (X ou Esc) → closePanel(): panelMode null, setView("aerial"), frase inicial
  └─ <app-modal placement="end">  (painel não modal: a página segue clicável; entrada animada; o conteúdo traz o cabeçalho)
       └─ @if (panelMode) <app-auth-form [mode]>   (features/auth/components/auth-form)
            ├─ modo "register": valida o cadastro; confirma a validação na tela
            ├─ modo "login": emite login(credenciais); a página chama AuthService.login; link "Esqueci minha senha" (app-text-link → /esqueci-minha-senha)
            └─ <app-form-panel>   (shared; título, campos, erro, status, X e botão)
```

- O `AuthForm` mantém o mesmo `app-form-panel` nos dois modos. Trocar de modo muda título, campos e botão, e o painel anima a altura (o cartão se transforma) e faz fade no conteúdo. Por isso o cadastro vira login sem fechar o painel.
- A página é quem chama `AuthService.login` e navega para `/home`. Ela guarda `loading` e `error` e os entrega ao `AuthForm`, que só valida e emite as credenciais.
- O formulário de entrada vem com `admin@crm.com` / `123456` preenchidos (protótipo; ver [CLAUDE.md](CLAUDE.md), seção 10).
- O componente de cena trata só do ciclo de vida e da troca de vista. A montagem (luzes, campo de cubos, núcleo luminoso, partículas) e a liberação de geometrias e materiais ficam em `scene-factory.ts`, com teste que confirma que cada recurso é liberado uma vez.
- Todo o módulo Three.js fica dentro do chunk lazy de `/login`. A tela inicial não carrega Three.js.
- `AuthPage` cancela a espera do login ao ser destruída (`takeUntilDestroyed`), para não navegar depois que a tela saiu.

### 4.4 Formulários

- Reactive Forms com `FormBuilder.nonNullable`. Validadores do Angular são a fonte da verdade no cliente.
- **Formulários novos usam `app-form-panel`** (`shared/components/form-panel`): a tela declara o `FormGroup` e a lista de campos (`FormPanelField`: nome, rótulo, tipo, opções e mensagens por tipo de erro). O painel renderiza título, campos, mensagem de erro (`role="alert"`), mensagem de status, botão de salvar e X de fechar. Ele emite `submitted` só com formulário válido e `closed` ao fechar. Quando o pai troca título e campos, o painel anima a altura do cartão e faz fade no conteúdo, sem recriar o componente.
- Campos individuais são componentes `shared/` que implementam `ControlValueAccessor` via `ControlValueBase`, então funcionam com `formControlName`. O `FormPanel` usa `app-input` e `app-select`.
- A mensagem de erro aparece só depois de `touched`. O painel escolhe a mensagem pelo primeiro erro do controle que tenha texto configurado.
- Erro que depende de dois campos (ex.: confirmação de senha) é um validador do próprio campo, que revalida quando o outro muda.
- `Input.focus()` permite à página levar o foco ao campo sem consultar o DOM.

---

## 5. Rotas

- `app.routes.ts` apenas compõe: `[ '' redirect, ...AUTH_ROUTES, ...HOME_ROUTES, ...PROJECTS_ROUTES, '**' redirect ]`.
- Cada feature declara as próprias rotas em `<feature>.routes.ts` com `loadComponent` (lazy).
- A ordem importa: a rota curinga `**` fica por último.

---

## 6. Decisões arquiteturais

| Decisão                                                          | Motivo                                                                                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Componentes standalone, sem `NgModule`                           | Padrão do Angular 22 e do projeto. Nenhum módulo tradicional.                                                                        |
| Organização por feature (`features/auth`, `features/home`)       | Mantém páginas, componentes, rotas e cálculos próximos. Facilita adicionar um domínio novo sem mexer nos outros.                     |
| `shared/` restrito a UI                                          | Evita virar pasta genérica. Componentes com regra de negócio ficariam acoplados a todas as telas.                                    |
| Rotas por feature (`*.routes.ts`)                                | Cada domínio declara o próprio acesso. `app.routes.ts` só compõe.                                                                    |
| Guards em arquivos separados (`auth.guard.ts`, `guest.guard.ts`) | Um artefato por arquivo, com o nome gerado pela CLI (`--type-separator=.`).                                                          |
| Three.js isolado em `features/auth/components/city-scene`        | Mantém o Three.js fora do bundle inicial: ele vem só no chunk de `/login` (≈ 558 kB sem compactação; o bundle inicial tem ≈ 287 kB). |
| `scene-factory.ts` separado do componente                        | Permite testar a montagem e a liberação de recursos sem WebGL.                                                                       |
| Signals para estado local e `toSignal` para Observables          | Padrão já usado no projeto. Nenhuma biblioteca de estado foi adicionada.                                                             |
| Função pura para indicadores (`buildDashboardStats`)             | Regra de negócio testável sem TestBed.                                                                                               |
| Mocks em `core/mocks` atrás de serviços com `Observable`         | Quando houver API, troca-se a implementação do serviço sem alterar as telas.                                                         |

---

## 7. Não existe ainda (não documentar como existente)

- `HttpClient`, interceptors e tratamento de erros HTTP. Quando houver backend, a comunicação entra em `core/services/` e os erros são mapeados lá.
- `environments/` (sem configuração de ambiente, pois não há API).
- Diretórios `directives/` e `pipes/`.
- Rotas das seções da sidebar além da Visão geral (`/projetos`, `/tarefas`, `/calendario`, `/equipe`, `/relatorios`, `/configuracoes`).
- Criar, editar ou mover tarefas e projetos. O quadro da home só exibe.
- Telas de CRM (clientes, negócios). `CrmDataService` e os tipos `Customer`, `Deal` e `Activity` continuam no `core/`, mas nenhuma tela os usa hoje. Os itens já apontam para esses caminhos; até existirem, o clique cai no redirecionamento padrão e volta para a home.
- Página e rota de recuperação de senha (`/esqueci-minha-senha`). O link "Esqueci minha senha" do login já aponta para esse caminho; até a rota existir, o clique cai no redirecionamento padrão e volta à tela de autenticação.
- Rota de cadastro e envio do cadastro ao servidor. O painel de cadastro existe na tela de login, mas só valida os dados.
- Formulário de login visível na tela de login (o método de envio existe, sem elemento que o dispare).
- Testes end-to-end.
- Estado de erro na home (os serviços mockados não falham). Carregamento (skeleton) e ausência de dados já existem.

---

## 8. Quando criar um novo artefato

- **Interceptor:** só quando houver `HttpClient` e um requisito transversal real (ex.: token, cabeçalho comum). Criar em `core/interceptors/`.
- **Environment:** só quando houver mais de um ambiente de API. Usar `src/environments/` e `fileReplacements` no `angular.json`.
- **Diretiva ou pipe:** só quando um mesmo comportamento aparecer em duas features. Ficam em `shared/directives/` ou `shared/pipes/`.
- **Nova feature:** criar `features/<nome>/` com `<nome>.routes.ts` e páginas em `pages/`, e registrar as rotas em `app.routes.ts`.

Gere sempre com a Angular CLI (comandos em [CLAUDE.md](CLAUDE.md), seção 4.4).### 4.3 AuthPage, cenário 3D e painel de autenticação

```text
AuthPage (página, lazy)
  ├─ <app-city-scene>  (features/auth/components/city-scene)
  │    ngAfterViewInit → fora da zona do Angular → start()
  │      ├─ sem WebGL: não desenha nada (o fundo preto continua)
  │      ├─ perfil DESKTOP ou MOBILE (largura < 768 px)
  │      ├─ createScene(profile)       → scene-factory.ts
  │      ├─ movimento reduzido: um quadro estático
  │      └─ senão: loop de animação, pausado com a aba oculta
  │    setView("side" | "aerial")      → transição suave entre a vista de cima e a lateral
  │    ngOnDestroy → para o loop, remove listeners, disposeScene, renderer.dispose()
  ├─ frase, botão "Cadastrar" (primary) e botão "Entrar" (outline)
  ├─ panelMode: "register" | "login" | null (null = painel fechado)
  │    Cadastrar → openRegister(): panelMode "register", setView("side"), frase de cadastro
  │    Entrar    → openLogin():    panelMode "login",    setView("side"), frase inicial
  │    com o painel aberto, o outro botão troca o modo sem fechar o painel
  │    fechar (X, Esc ou fundo) → closePanel(): panelMode null, setView("aerial"), frase inicial
  └─ <app-modal placement="end">  (sem escurecer o fundo; entrada animada; o conteúdo traz o cabeçalho)
       └─ @if (panelMode) <app-auth-form [mode]>   (features/auth/components/auth-form)
            ├─ modo "register": valida o cadastro; confirma a validação na tela
            ├─ modo "login": emite login(credenciais); a página chama AuthService.login
            └─ <app-form-panel>   (shared; título, campos, erro, status, X e botão)
```

- O `AuthForm` mantém o mesmo `app-form-panel` nos dois modos. Trocar de modo muda título, campos e botão, e o painel anima a altura (cartão se transforma) e faz fade no conteúdo. Por isso o cadastro vira login sem fechar o painel.
- A página é quem chama `AuthService.login` e navega para `/home`. Ela guarda `loading` e `error` e os entrega ao `AuthForm`, que só valida e emite as credenciais.
- O formulário de entrada vem com `admin@crm.com` / `123456` preenchidos (protótipo; ver [CLAUDE.md](CLAUDE.md), seção 10).
- O componente de cena trata só do ciclo de vida e da troca de vista. A montagem (luzes, campo de cubos, núcleo luminoso, partículas) e a liberação de geometrias e materiais ficam em `scene-factory.ts`, com teste que confirma que cada recurso é liberado uma vez.
- Todo o módulo Three.js fica dentro do chunk lazy de `/login`. A tela inicial não carrega Three.js.
- `AuthPage` cancela a espera do login ao ser destruída (`takeUntilDestroyed`), para não navegar depois que a tela saiu.

### 4.4 Formulários

- Reactive Forms com `FormBuilder.nonNullable`. Validadores do Angular são a fonte da verdade no cliente.
- **Formulários novos usam `app-form-panel`** (`shared/components/form-panel`): a tela declara o `FormGroup` e a lista de campos (`FormPanelField`: nome, rótulo, tipo, opções e mensagens por tipo de erro). O painel renderiza título, campos, mensagem de erro (`role="alert"`), mensagem de status, botão de salvar e X de fechar. Ele emite `submitted` só com formulário válido e `closed` ao fechar. Quando o pai troca título e campos, o painel anima a altura do cartão e faz fade no conteúdo, sem recriar o componente.
- Campos individuais são componentes `shared/` que implementam `ControlValueAccessor` via `ControlValueBase`, então funcionam com `formControlName`. O `FormPanel` usa `app-input` e `app-select`.
- A mensagem de erro aparece só depois de `touched`. O painel escolhe a mensagem pelo primeiro erro do controle que tenha texto configurado.
- Erro que depende de dois campos (ex.: confirmação de senha) é um validador do próprio campo, que revalida quando o outro muda.
- `Input.focus()` permite à página levar o foco ao campo sem consultar o DOM.

---

## 5. Rotas

- `app.routes.ts` apenas compõe: `[ '' redirect, ...AUTH_ROUTES, ...HOME_ROUTES, ...PROJECTS_ROUTES, '**' redirect ]`.
- Cada feature declara as próprias rotas em `<feature>.routes.ts` com `loadComponent` (lazy).
- A ordem importa: a rota curinga `**` fica por último.

---

## 6. Decisões arquiteturais

| Decisão                                                          | Motivo                                                                                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Componentes standalone, sem `NgModule`                           | Padrão do Angular 22 e do projeto. Nenhum módulo tradicional.                                                                        |
| Organização por feature (`features/auth`, `features/home`)       | Mantém páginas, componentes, rotas e cálculos próximos. Facilita adicionar um domínio novo sem mexer nos outros.                     |
| `shared/` restrito a UI                                          | Evita virar pasta genérica. Componentes com regra de negócio ficariam acoplados a todas as telas.                                    |
| Rotas por feature (`*.routes.ts`)                                | Cada domínio declara o próprio acesso. `app.routes.ts` só compõe.                                                                    |
| Guards em arquivos separados (`auth.guard.ts`, `guest.guard.ts`) | Um artefato por arquivo, com o nome gerado pela CLI (`--type-separator=.`).                                                          |
| Three.js isolado em `features/auth/components/city-scene`        | Mantém o Three.js fora do bundle inicial: ele vem só no chunk de `/login` (≈ 558 kB sem compactação; o bundle inicial tem ≈ 287 kB). |
| `scene-factory.ts` separado do componente                        | Permite testar a montagem e a liberação de recursos sem WebGL.                                                                       |
| Signals para estado local e `toSignal` para Observables          | Padrão já usado no projeto. Nenhuma biblioteca de estado foi adicionada.                                                             |
| Função pura para indicadores (`buildDashboardStats`)             | Regra de negócio testável sem TestBed.                                                                                               |
| Mocks em `core/mocks` atrás de serviços com `Observable`         | Quando houver API, troca-se a implementação do serviço sem alterar as telas.                                                         |

---

## 7. Não existe ainda (não documentar como existente)

- `HttpClient`, interceptors e tratamento de erros HTTP. Quando houver backend, a comunicação entra em `core/services/` e os erros são mapeados lá.
- `environments/` (sem configuração de ambiente, pois não há API).
- Diretórios `directives/` e `pipes/`.
- Rota de cadastro e envio do cadastro ao servidor. O painel de cadastro existe na tela de login, mas só valida os dados.
- Formulário de login visível na tela de login (o método de envio existe, sem elemento que o dispare).
- Testes end-to-end.
- Estado de erro na home (os serviços mockados não falham). Carregamento (skeleton) e ausência de dados já existem.

---

## 8. Quando criar um novo artefato

- **Interceptor:** só quando houver `HttpClient` e um requisito transversal real (ex.: token, cabeçalho comum). Criar em `core/interceptors/`.
- **Environment:** só quando houver mais de um ambiente de API. Usar `src/environments/` e `fileReplacements` no `angular.json`.
- **Diretiva ou pipe:** só quando um mesmo comportamento aparecer em duas features. Ficam em `shared/directives/` ou `shared/pipes/`.
- **Nova feature:** criar `features/<nome>/` com `<nome>.routes.ts` e páginas em `pages/`, e registrar as rotas em `app.routes.ts`.

Gere sempre com a Angular CLI (comandos em [CLAUDE.md](CLAUDE.md), seção 4.4).
