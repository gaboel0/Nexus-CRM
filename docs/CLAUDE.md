# Instruções de desenvolvimento — CRM Dashboard

Manual de trabalho para o Claude Code neste repositório. Regras obrigatórias estão marcadas como **obrigatório** ou **NÃO**; recomendações estão marcadas como _recomendação_.

Referências:

- [ARCHITECTURE.md](ARCHITECTURE.md) — arquitetura implementada: camadas, fluxos, rotas e decisões.
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) — tokens, estados e padrões visuais. **Consulte antes de qualquer alteração de interface.**
- [DESYGN-SYSTEM_NEXUS.png](DESYGN-SYSTEM_NEXUS.png) — imagem de referência do design system.

**Antes de implementar qualquer funcionalidade nova** (não só refatorações), siga a seção 4 e leia [ARCHITECTURE.md](ARCHITECTURE.md). Uma funcionalidade nova deve respeitar a arquitetura existente, reutilizar componentes de `shared/` e não criar arquivos soltos na raiz de `src/app/`.

---

## 1. Papel

Atue como desenvolvedor web sênior neste projeto. Priorize:

- Código limpo, legível, modular e fácil de manter.
- Aderência à stack e aos padrões já existentes (seções 2 e 4).
- Separação de responsabilidades entre páginas, componentes, serviços, modelos e mocks.
- Reutilização de código existente antes de criar abstrações novas.
- Acessibilidade, validação de dados, segurança e consistência visual.

O objetivo é uma solução que possa ser mantida e ampliada, não apenas uma que compile.

---

## 2. Stack (verificada no projeto)

| Item        | Versão / Configuração                                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework   | Angular 22.2.x (`@angular/core` ^22.2.0; CLI 22.2.2). Componentes **standalone** (não declarar `standalone: true`).                                             |
| Estado      | Signals (`signal`, `computed`, `toSignal`); RxJS para fluxos assíncronos de serviço.                                                                            |
| DI          | `inject()`.                                                                                                                                                     |
| Templates   | Control flow nativo (`@if`, `@for` com `track`, `@empty`).                                                                                                      |
| Formulários | Reactive Forms (`FormBuilder.nonNullable`, `ReactiveFormsModule`).                                                                                              |
| Roteamento  | `provideRouter`; rotas por feature com `loadComponent` (lazy); guards funcionais (`CanActivateFn`).                                                             |
| Estilos     | Tailwind CSS 4.3 via `@tailwindcss/postcss`, com `@import 'tailwindcss'` em `src/styles.css`. **Não existe** `tailwind.config.js`: os tokens ficam em `@theme`. |
| Linguagem   | TypeScript 6.0.x.                                                                                                                                               |
| 3D (login)  | `three` 0.186.x e `@types/three` 0.186.x. Usados **somente** em `features/auth/components/city-scene/`.                                                         |
| Locale      | `pt-BR` (`LOCALE_ID` em `app.config.ts`, locale registrado).                                                                                                    |
| Dados       | **Somente mocks**. Não há backend nem `HttpClient`.                                                                                                             |
| Testes      | Vitest 5 via builder `@angular/build:unit-test` (`ng test`), com jsdom 30.                                                                                      |
| Formatação  | Prettier 3 (`.prettierrc`: `printWidth 100`, aspas simples, parser `angular` para HTML).                                                                        |
| Editor      | `.editorconfig`: UTF-8, indentação de 2 espaços, nova linha final.                                                                                              |

---

## 3. Estrutura de pastas

```text
src/
├── main.ts                       # bootstrap
├── styles.css                    # Tailwind e tokens do design system (@theme)
├── index.html                    # lang="pt-BR"
└── app/
    ├── app.ts / app.html / app.css   # shell: <router-outlet /> e botão de tema fixo
    ├── app.config.ts             # providers globais
    ├── app.routes.ts             # composição das rotas das features
    ├── core/                     # singletons globais, sem UI
    │   ├── guards/               # authGuard, guestGuard
    │   ├── services/             # AuthService, ProjectDataService, CrmDataService (sem uso na tela), ThemeService
    │   ├── models/               # tipos de domínio compartilhados (project.models.ts, crm.models.ts)
    │   └── mocks/                # dados mockados
    ├── shared/                   # UI reutilizável, sem regra de negócio (ponto de entrada: index.ts)
    │   ├── components/           # badge, button, card, checkbox, field-message, form-panel, icon, input, modal, progress-bar, select, sidebar (e app-nav.ts), skeleton, text-link, textarea
    │   ├── forms/                # ControlValueBase
    │   └── styles/               # field.styles.ts (classes base dos campos)
    └── features/                 # funcionalidades por domínio
        ├── auth/                 # auth.routes.ts, pages/auth-page, components/city-scene, components/auth-form
        ├── home/                 # home.routes.ts, dashboard-stats.ts, components/task-board, components/task-card, components/task-details, components/task-comments, pages/home-page
        └── projects/             # projects.routes.ts, project-progress.ts, project-list.ts, project-detail.ts, pages/project-list-page, pages/project-detail-page
```

Responsabilidades de cada camada e regras de dependência estão em [ARCHITECTURE.md](ARCHITECTURE.md), seção 3.

---

## 4. Arquitetura Angular e boas práticas obrigatórias

### 4.1 Versão e convenções

- Angular 22.2: componentes standalone, `inject()`, signals, `input()`, `output()`, `viewChild()`, `computed()`, control flow nativo e `loadComponent`.
- **NÃO** use APIs de versões anteriores ou de padrões descontinuados: `NgModule` para componentes do app, `*ngIf`/`*ngFor`, decoradores `@Input`/`@Output`, `HttpClientModule`.
- **NÃO** atualize Angular nem dependências sem pedido explícito.

### 4.2 Estrutura oficial e responsabilidades

| Pasta                     | Responsabilidade                  | Conteúdo permitido                                                             |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------------------ |
| `app/core/`               | Infraestrutura singleton, sem UI  | guards, services, models, mocks; futuramente interceptors                      |
| `app/shared/`             | Componentes visuais reutilizáveis | components, forms (contratos), styles (classes base)                           |
| `app/features/<domínio>/` | Funcionalidade completa           | `<domínio>.routes.ts`, `pages/`, `components/`, arquivos de cálculo da feature |
| `app/` (raiz)             | Shell e configuração              | `app.ts`, `app.html`, `app.config.ts`, `app.routes.ts` e seus specs            |

- **NÃO** crie arquivos soltos na raiz de `src/app/`. Se um arquivo é de uma funcionalidade, ele vai para `features/<domínio>/`.
- **NÃO** transforme `shared/` ou `core/` em lixeira. Um arquivo entra em `shared/` quando é UI usada por mais de uma feature; entra em `core/` quando é infraestrutura global.
- **NÃO** importe arquivos internos de uma feature a partir de outra. Se o elemento for compartilhado, mova-o para `shared/` (UI) ou `core/` (dados e regras globais).
- Pastas `environments/`, `interceptors/`, `directives/` e `pipes/` **não existem** hoje. Crie-as só quando houver uso real (ver [ARCHITECTURE.md](ARCHITECTURE.md), seção 8).

### 4.3 Nomenclatura

- Arquivos em kebab-case, com o papel no nome: `auth-page.ts`, `auth-page.html`, `auth-page.spec.ts`, `auth.service.ts`, `auth.guard.ts`, `guest.guard.ts`, `auth.routes.ts`, `crm.models.ts`.
- Componentes sem sufixo: `AuthPage`, `HomePage`, `CityScene`. Páginas usam o sufixo `-page` no arquivo (`home-page.ts`) e `Page` na classe. Seletores com prefixo `app-` (`app-input`, `app-city-scene`).
- Serviços com sufixo `Service`: `AuthService`, `CrmDataService`. Guards são funções: `authGuard`, `guestGuard`.
- Rotas por feature em constantes `*_ROUTES` (`AUTH_ROUTES`, `HOME_ROUTES`). Caminhos em minúsculas e sem barra inicial (`'login'`, `'home'`).
- Interfaces e tipos sem prefixo `I` (`User`, `Deal`, `DashboardStats`).
- Tipo usado por mais de uma feature vai para `core/models/`. Tipo de uma feature fica no arquivo da feature.
- Specs `*.spec.ts` ao lado do arquivo testado.

### 4.4 Angular CLI para gerar artefatos

Gere com `ng generate` (ou `ng g`), salvo justificativa técnica. Comandos verificados nesta versão:

| Artefato                 | Comando                                                             | Arquivos gerados                        |
| ------------------------ | ------------------------------------------------------------------- | --------------------------------------- |
| Página ou componente     | `npx ng g component features/<domínio>/pages/<pagina> --style=none` | `<pagina>.ts`, `.html`, `.spec.ts`      |
| Componente compartilhado | `npx ng g component shared/components/<nome> --style=none`          | `<nome>.ts`, `.html`, `.spec.ts`        |
| Serviço                  | `npx ng g service core/services/<nome> --type service`              | `<nome>.service.ts`, `.service.spec.ts` |
| Guard                    | `npx ng g guard core/guards/<nome> --type-separator=.`              | `<nome>.guard.ts`, `.guard.spec.ts`     |

- `--style=none`: o projeto estiliza com Tailwind no template, sem arquivo CSS por componente.
- `--type-separator=.` (guard) e `--type service` (serviço) mantêm o padrão `auth.guard.ts` / `auth.service.ts`. Sem essas opções, a CLI gera `nome-guard.ts` ou `nome.ts`.
- A CLI gera os `.spec.ts`; **substitua o conteúdo gerado por testes reais** (seção 4.9).
- **NÃO** gere módulos, interceptors, diretivas ou pipes sem uso real.
- Arquivos que a CLI não gera (`*.routes.ts`, arquivos de cálculo, `scene-factory.ts`) são criados à mão. Cite isso no resumo da tarefa.

### 4.5 Separação de responsabilidades

- **Página** (`pages/`): compõe a tela, coordena o fluxo (submit, navegação) e liga sinais e serviços. **NÃO** faz cálculo de indicador nem chamada HTTP.
- **Componente compartilhado** (`shared/`): recebe entradas, emite saídas e não conhece serviços.
- **Serviço** (`core/services/`): acesso a dados e autenticação; devolve `Observable`.
- **Função pura** (`features/<domínio>/`): regra de cálculo ou transformação, testável sem Angular (ex.: `buildDashboardStats`).
- **Guard** (`core/guards/`): decide acesso a rota a partir do estado do serviço.
- **Componente de cena 3D** (`features/auth/components/city-scene/`): ciclo de vida em `city-scene.ts`; montagem, animação e liberação em `scene-factory.ts`; gerador determinístico em `seeded-random.ts`.
- **Validação de formulário**: validadores do Angular no `FormGroup`; mensagens configuradas em `FormPanelField.errors` e exibidas pelo `app-form-panel`.
- **NÃO** misture num mesmo arquivo renderização 3D, marcação, chamada de API, validação de negócio e autenticação.

### 4.6 Injeção de dependência, tipagem e organização

- `inject()` na declaração do campo. Dependências como `private readonly`; estado e métodos usados pelo template como `protected readonly`.
- Serviços com `@Injectable({ providedIn: 'root' })`. **NÃO** registre serviço em `providers` de componente sem motivo.
- **NÃO** use `any`. **NÃO** use `@ts-ignore`, `as any` ou `@ts-expect-error` sem justificativa escrita no código.
- Respeite as opções ativas do `tsconfig.json`: `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`.
- O `tsconfig.json` **não** define `"strict": true`. Não ative nem desative `strict` por conta própria (decisão do time, seção 10).
- Tipos explícitos em entradas, saídas, retornos de serviços e funções exportadas.
- `@for` sempre com `track` por chave estável (`id`).

### 4.7 Estado, Signals, RxJS e ciclo de vida

- Estado local: `signal`. Derivações: `computed`. Observable para sinal: `toSignal(obs)`. Para dados carregados, **sem** `initialValue`: `undefined` indica carregamento (seção 5.3).
- Estado de serviço: `signal` privado, exposto como somente leitura com `asReadonly()` (ver `AuthService`).
- Assinatura manual em componente: **obrigatório** encerrar com `takeUntilDestroyed(this.destroyRef)`. Prefira `toSignal` quando o valor vai para o template.
- Recurso externo (WebGL, `ResizeObserver`, listeners em `document`/`window`): crie em `ngAfterViewInit` e libere em `ngOnDestroy`, na ordem inversa da criação.
- Loop de animação fora da zona do Angular (`NgZone.runOutsideAngular`).
- `effect()` só para sincronizar com o DOM ou APIs do navegador (ex.: foco no modal), não para derivar estado.
- **NÃO** introduza biblioteca de estado (NgRx, Akita etc.) sem necessidade concreta.

### 4.8 Comunicação com API, erros e autenticação

- Hoje os serviços simulam a API com `delay` sobre mocks. Ao integrar um backend, o `HttpClient` entra **somente** em `core/services/`.
- **NÃO** invente endpoints, parâmetros ou formatos de resposta. Peça o contrato se ele não existir no repositório.
- Erros: o serviço emite um `Error` cuja mensagem pode ser mostrada ao usuário (padrão do login). Ao integrar HTTP, mapeie `HttpErrorResponse` para mensagens do domínio dentro do serviço. A tela trata `error` e exibe feedback com `role="alert"`.
- Autenticação: `AuthService` é a única fonte da sessão. Os guards leem o estado dele.
- Autorização: não existe. `User.role` é exibido, mas não controla acesso.
- Os guards **não são controle de segurança** (seção 7).

### 4.9 Testes

- Teste obrigatório para serviços, guards, funções puras, `computed` com regra, validações, configuração de rotas e liberação de recursos.
- Use os globais do Vitest (`describe`, `it`, `expect`, `vi`), como nos specs existentes.
- Atrasos (`delay`, `timer`): `vi.useFakeTimers()` e `vi.advanceTimersByTime(ms)`; restaure com `vi.useRealTimers()` no `afterEach`.
- Depois de mudar sinais, entradas ou eventos, chame `fixture.detectChanges()`.
- Em campos, dispare `input` e `blur` no elemento `<input>`, não no host `app-input`. O host também recebe o atributo `id`, e `querySelector('#id')` o encontra primeiro.
- Limpe o `localStorage` em `beforeEach` e `afterEach` quando o teste usar sessão. Use as constantes exportadas (`AUTH_STORAGE_KEY`), não strings soltas.
- O jsdom não tem WebGL. O componente de cena testa o caminho sem WebGL; a montagem e a liberação de recursos são testadas em `scene-factory.spec.ts`.
- Antes de alterar um comportamento, leia o teste existente.

### 4.10 Critérios para novas dependências

- Antes de adicionar, confirme que Angular, RxJS ou Tailwind não resolvem o caso.
- Justifique no resumo: motivo, impacto no bundle e licença.
- `three` fica restrito ao componente de cena.

### 4.11 Acessibilidade, responsividade e desempenho

- Detalhes visuais e de acessibilidade estão em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md), seções 10 e 11.
- Todo campo tem `label` associado; erro com `aria-invalid` e `aria-describedby`; foco visível; navegação completa por teclado.
- Layout utilizável a partir de 320 px, sem rolagem horizontal da página.
- Respeite `prefers-reduced-motion`: a cena 3D mostra um quadro estático nesse caso.
- O canvas 3D é decorativo: `aria-hidden` e `pointer-events-none`, para não bloquear cliques.
- Desempenho: rotas lazy; Three.js só no chunk de `/login`; perfil mobile com menos objetos, menor resolução e sem sombras; animação pausada com a aba oculta.
- Componentes compartilhados usam `ChangeDetectionStrategy.OnPush`. _Recomendação:_ use `OnPush` também nas páginas novas.
- **NÃO** use `innerHTML` nem `bypassSecurityTrust*`.

### 4.12 Preservar funcionalidades em refatorações

- Antes de mover ou alterar um arquivo, identifique quem o importa, quais rotas, guards e serviços dependem dele.
- Depois de mover, atualize imports, rotas e documentação, e rode build e testes.
- **NÃO** substitua código funcional por mock, implementação provisória ou versão simplificada.
- **NÃO** altere contratos de API, variáveis de ambiente ou regras de autenticação sem pedido.
- **NÃO** remova funcionalidade para "limpar" sem entender como ela funciona.
- Se a página de login ou a cena 3D mudar, preserve o visual e o comportamento; não simplifique a cena para facilitar a refatoração.

### 4.13 Comandos

| Objetivo                    | Comando                           |
| --------------------------- | --------------------------------- |
| Servidor de desenvolvimento | `npm start`                       |
| Build de produção           | `npm run build`                   |
| Testes unitários            | `npx ng test --watch=false`       |
| Formatação (verificação)    | `npx prettier --check src`        |
| Formatação (correção)       | `npx prettier --write <arquivos>` |

**Não há script de lint nem ESLint.** Não afirme que o código passou em lint.

### 4.14 Atualização da documentação

- Mudou arquitetura, padrão, rota, pasta, comando ou tela: atualize no mesmo trabalho `CLAUDE.md`, `ARCHITECTURE.md` e, se houver impacto visual, `DESIGN-SYSTEM.md`.
- **NÃO** documente como existente o que ainda não foi implementado.

### 4.15 Exemplos

Os exemplos abaixo ilustram o padrão. A feature `clientes` **não existe** no projeto.

Nova página em uma feature:

```bash
npx ng g component features/clientes/pages/lista --style=none
```

```ts
// features/clientes/clientes.routes.ts (arquivo criado à mão)
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const CLIENTES_ROUTES: Routes = [
  {
    path: 'clientes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/lista/lista').then((m) => m.Lista),
  },
];
```

Em `app.routes.ts`, inclua `...CLIENTES_ROUTES,` antes da rota curinga `**`.

Serviço e consumo na página:

```ts
// core/services/clientes.service.ts
@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly data = inject(CrmDataService);

  getClientes(): Observable<Customer[]> {
    return this.data.getCustomers();
  }
}

// features/clientes/pages/lista/lista.ts
// Sem initialValue: undefined = carregando (mostra skeleton). Lista vazia é resposta válida.
private readonly clientesResposta = toSignal(this.clientesService.getClientes());
protected readonly clientes = computed(() => this.clientesResposta() ?? []);
protected readonly carregando = computed(() => this.clientesResposta() === undefined);
```

Regra de cálculo: função pura em `features/<domínio>/`, com teste em `*.spec.ts` ao lado.

Recurso externo: criar em `ngAfterViewInit`, liberar em `ngOnDestroy` (ver `city-scene.ts`).

---

## 5. Interface e Tailwind CSS

### 5.1 Componentes reutilizáveis (obrigatório)

- **Sempre** use os componentes de `shared/` para botões, campos (input, select, textarea), checkboxes, cards, modais e formulários (`app-form-panel`). Importe pelo ponto de entrada: `import { Button, Input } from '../../../../shared';` (o caminho relativo depende da profundidade do arquivo).
- **NÃO** escreva nas páginas classes de botão, campo, card ou modal (ex.: `rounded-lg border border-slate-300 px-3 py-2`). Se estiver prestes a copiar uma dessas combinações, use o componente.
- Se o componente não tiver a variante necessária, **estenda o componente compartilhado** (nova `variant`, nova entrada). Antes, procure os usos, pois ele aparece em várias telas.
- Se um elemento de UI aparecer em uma segunda tela e ainda não houver componente, crie-o em `shared/components/<nome>/` com `ChangeDetectionStrategy.OnPush`, `templateUrl`, exporte em `shared/index.ts` e adicione o `*.spec.ts`.
- Campos implementam `ControlValueAccessor` (via `ControlValueBase`) para funcionar com `formControl` e `formControlName`.
- Componentes compartilhados usam apenas os tokens do design system.
- Ícones **só** por `app-icon` (traço fino `light` por padrão). Ícone novo: inclua o nome em `IconName` (`icon.ts`) e na lista `icon_names` da URL da fonte em `index.html`, em ordem alfabética; sem isso ele aparece como texto.

### 5.2 Tokens e classes

- Use os tokens e classes de [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md). **NÃO** invente cores, alturas ou raios para uma tela.
- Prefira utilitários padronizados a valores arbitrários (`bg-[#...]`, `h-[37px]`). Valor arbitrário repetido vira token.
- Não altere tokens globais para resolver um problema local. Mudança em token compartilhado deve ser justificada no resumo.
- **NÃO** crie classes CSS globais ad hoc em `styles.css` para um único componente. Em `styles.css` ficam só o `@import` do Tailwind, o `@theme`, a barra de rolagem global (`@layer base`) e o escopo `[data-theme='dark']`, que redefine os tokens para o tema escuro (ver [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md), seção 8.1). Para funcionar nos dois temas, use tokens, não cores fixas.
- Mantenha `hover`, `focus-visible`, `active`, `disabled`, `error` e `success` consistentes entre componentes do mesmo tipo.
- **NÃO** introduza outra biblioteca de estilo (CSS-in-JS, Bootstrap, Material etc.) sem justificativa.
- Estilos inline e `[class]`/`[style]` com lógica repetida: mova a lógica para `computed` ou método.

### 5.3 Estados e layout

- **Skeleton loading (obrigatório):** toda página que carrega dados mostra `app-skeleton` no **formato do conteúdo** (cards, linhas de tabela, itens de lista) enquanto a resposta não chega. **NÃO** use texto solto "Carregando..." nem spinner de página. O contêiner do skeleton tem `role="status"`, `aria-live="polite"` e um texto `sr-only` (ex.: "Carregando os dados do painel..."). Páginas sem carregamento de dados (ex.: tela de autenticação) não precisam.
- **Carregar certo:** "carregando" significa "a resposta ainda não chegou", nunca "a lista está vazia". Use `toSignal(obs)` **sem** `initialValue` (`undefined` = carregando) e derive as listas com `computed(() => resposta() ?? [])`, como na home. Lista vazia é resposta válida: mostre o estado vazio.
- Telas com dados assíncronos tratam carregamento (skeleton), sucesso, erro e ausência de dados.
- Layout de uma coluna por padrão, expandindo com `sm:`, `md:`, `lg:`. Formulários cabem em 320 px com margem lateral de 16 px.
- Teste em largura de celular antes de encerrar uma tarefa de interface.

---

## 6. Formulários e campos

- **Formulário novo usa `app-form-panel`** (`shared/components/form-panel`): a tela declara o `FormGroup` e a lista de `FormPanelField` (nome, rótulo, tipo, opções e mensagens por tipo de erro). O painel traz título, campos, botão Salvar e X de fechar. **NÃO** monte título, X e botão de salvar à mão numa tela.
- Todo campo usa `app-input`, `app-select`, `app-textarea` ou `app-checkbox`. **NÃO** crie campos com classes próprias.
- Cada campo tem `<label>` associado (`for`/`id`). Erro textual abaixo do campo, com `aria-invalid` e `aria-describedby`.
- A mensagem de erro aparece depois de `touched`, como em `auth-page.html`.
- Use `novalidate` no `<form>`. A validação do Angular (`Validators`) é a fonte da verdade no cliente.
- Botões de envio ficam desabilitados durante a operação assíncrona (`loading`).
- Para levar o foco a um campo, use o método `focus()` do componente (`Input.focus()`), e não `querySelector`.
- Garanta uso completo por teclado e foco visível.

---

## 7. Dados, segurança e sessão

- Os dados são **mocks** em `core/mocks/mock-data.ts`, consumidos pelos serviços em `core/services/`. Os serviços já devolvem `Observable` para facilitar a troca por `HttpClient`.
- **NÃO** substitua silenciosamente uma integração real por dados simulados. Se precisar de mock temporário, deixe-o explícito e documentado.
- `authGuard` e `guestGuard` **não são controle de segurança**: verificam apenas se existe usuário no `localStorage`. Qualquer controle real depende do backend. Não afirme o contrário.
- Valide no cliente, mas considere a validação do servidor como a definitiva quando ela existir.
- **NÃO** insira conteúdo não confiável com `innerHTML` ou `bypassSecurityTrust*`. Use interpolação do Angular.
- **NÃO** exponha tokens, credenciais ou segredos no código, no template ou em logs.
- **NÃO** persista dados sensíveis no `localStorage`. A sessão (`crm.currentUser`, chave `AUTH_STORAGE_KEY`) é um protótipo; não expanda esse padrão.
- **NÃO** enfraqueça controles existentes para facilitar uma implementação.

---

## 8. Fluxo de trabalho

Para cada tarefa:

1. **Entender:** leia a seção 4, [ARCHITECTURE.md](ARCHITECTURE.md) e os arquivos envolvidos, com seus guards, serviços e importadores.
2. **Planejar:** escolha a menor solução coerente e liste os impactos em outras telas.
3. **Implementar:** alterações localizadas, consistentes e reutilizáveis. Use a CLI para gerar artefatos.
4. **Validar:** execute os comandos da seção 4.13 e os testes da seção 4.9.
5. **Revisar:** qualidade, segurança, acessibilidade e aderência ao design system.
6. **Reportar:** arquivos alterados, funcionalidades, decisões técnicas, testes com resultado, e problemas separados entre pré-existentes e introduzidos.

**NÃO** modifique arquivos sem entender a função deles no projeto.
**NÃO** reescreva uma funcionalidade inteira quando uma correção localizada resolve.

---

## 9. Git e alterações em andamento

- **NÃO** faça commit, push ou criação de branch sem pedido explícito.
- **NÃO** reverta nem sobrescreva alterações não commitadas. Elas são trabalho do usuário.
- Mudanças em arquivos fora do escopo da tarefa devem ser explicadas no resumo.

---

## 10. Pendências conhecidas (pré-existentes)

Estado observado durante a análise. **Não corrija** estes itens sem que a tarefa peça; mencione-os quando forem relevantes.

| #   | Onde                                                             | Problema                                                                                                                                                                                                                                                           |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `features/auth/components/auth-form/auth-form.ts`                | O formulário de entrada do painel vem pré-preenchido com `admin@crm.com` / `123456`. As credenciais não aparecem como texto na tela. Remover antes de produção, junto com o envio do login (ver `ARCHITECTURE.md`, seção 4.3).                                     |
| 2   | `core/mocks/mock-data.ts`                                        | Senhas em texto puro (o próprio comentário reconhece que é mock).                                                                                                                                                                                                  |
| 3   | `core/services/auth.service.ts`                                  | Sessão em `localStorage`, sem token.                                                                                                                                                                                                                               |
| 4   | `core/guards/auth.guard.ts`                                      | Guard só verifica presença do usuário (seção 7).                                                                                                                                                                                                                   |
| 5   | `features/home/pages/home-page/home-page.ts`                     | **Resolvida:** o carregamento usa respostas `undefined` e skeleton; listas vazias mostram estado vazio. Falta o estado de **erro** (os mocks não falham).                                                                                                          |
| 6   | `core/services/crm-data.service.ts`, `core/models/crm.models.ts` | Desde a mudança para gestão de projetos, `CrmDataService`, `MOCK_CUSTOMERS`/`MOCK_DEALS`/`MOCK_ACTIVITIES` e os tipos `Customer`/`Deal`/`Activity` não são usados por nenhuma tela. Remover ou reaproveitar por decisão do time.                                   |
| 7   | `tsconfig.json`                                                  | Sem `"strict": true`.                                                                                                                                                                                                                                              |
| 8   | Projeto inteiro                                                  | Sem ESLint nem lint configurado.                                                                                                                                                                                                                                   |
| 9   | Testes                                                           | Cobertos: serviços, guards, rotas, login, home, cálculo de indicadores, cena (sem WebGL) e liberação de recursos. Faltam testes end-to-end e de renderização WebGL.                                                                                                |
| 10  | `features/auth/pages/auth-page/auth-page.html`                   | Cores fora dos tokens: gradiente de fundo do login, `text-white`, `bg-black`, no login. Na home, os selos de prioridade e de status de projeto usam tokens com opacidade (`bg-crm-error/10`, `bg-crm-primary/10`, `bg-crm-success/10`), ainda sem decisão do time. |

---

## 11. Escopo de documentação

- Não documente funcionalidades que ainda não existem como se existissem.
- Quando o código contradizer estes documentos, atualize o documento junto com a mudança.
- Este arquivo trata de processo e código. Regras visuais ficam em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md), e a arquitetura implementada fica em [ARCHITECTURE.md](ARCHITECTURE.md).
