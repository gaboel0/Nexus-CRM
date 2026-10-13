# Design System — CRM Dashboard

Referência oficial para decisões visuais. Derivado da imagem de referência [DESYGN-SYSTEM_NEXUS.png](DESYGN-SYSTEM_NEXUS.png) ("CRM Design System Minimalista": guia de tokens, estados de campos, catálogo de controles e configuração Tailwind). Em caso de dúvida sobre um valor, consulte a imagem.

Documento irmão: [CLAUDE.md](CLAUDE.md) — regras de processo e código. Consulte-o também.

Legenda de status usada neste documento:

- **Oficial** — valor vindo diretamente da referência.
- **Estimado** — lido visualmente da imagem; confirmar antes de tratar como fixo.
- **Proposta** — extensão coerente que a referência não cobre; exige aprovação.
- **Não implementado** — padrão definido, sem componente no projeto ainda.

---

## 1. Identidade visual

- Estilo minimalista, moderno e profissional, com densidade adequada a telas de gestão.
- **Azul é a cor de interação** (ações primárias, foco, itens ativos, seleções).
- Fundo geral claro e neutro; superfícies brancas para cards e campos.
- Texto principal escuro; texto secundário cinza-azulado.
- Bordas finas e discretas (`1px`), sem excesso de contraste.
- Sombras apenas quando necessário para separar uma superfície (ex.: cards), e sempre suaves.
- Sem elementos decorativos. Hierarquia vem de tamanho, peso e cor do texto, não de ornamentos.

---

## 2. Tokens de cor

Todos os valores são **Oficiais**.

| Token           | Valor     | Uso                                                          | Classe Tailwind (após `@theme`, seção 8)                   |
| --------------- | --------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| `primary`       | `#2563EB` | Ações primárias, foco, elementos ativos                      | `bg-crm-primary`, `text-crm-primary`, `border-crm-primary` |
| `primary-hover` | `#1D4ED8` | Hover de ações azuis                                         | `hover:bg-crm-primary-hover`                               |
| `light`         | `#EFF6FF` | Destaques suaves, seleções, badges informativos              | `bg-crm-light`                                             |
| `canvas`        | `#F8FAFC` | Fundo geral da aplicação; fundo de campo desabilitado        | `bg-crm-canvas`                                            |
| `surface`       | `#FFFFFF` | Cards, formulários, campos                                   | `bg-crm-surface`                                           |
| `text`          | `#0F172A` | Texto principal e títulos                                    | `text-crm-text`                                            |
| `muted`         | `#64748B` | Texto secundário, descrições, placeholders, rótulos de ajuda | `text-crm-muted`                                           |
| `border`        | `#E2E8F0` | Bordas e divisores                                           | `border-crm-border`                                        |
| `error`         | `#DC2626` | Erros e estados inválidos                                    | `text-crm-error`, `border-crm-error`                       |
| `success`       | `#16A34A` | Sucesso e estados válidos                                    | `border-crm-success`, ícones de sucesso                    |

### Regras de uso

- Use apenas esses tokens para cor de interface. Não use `indigo`, `slate`, `red` ou outras paletas padrão do Tailwind diretamente em telas novas.
- **Contraste de texto:** `#16A34A` sobre branco tem contraste aproximado de 3,3:1, abaixo do mínimo de 4,5:1 para texto pequeno. Por isso, a mensagem de sucesso textual deve usar um verde mais escuro (**Proposta:** `#15803D`, aproximadamente 5:1), mantendo `#16A34A` para bordas e ícones.
- `#64748B` sobre `#F8FAFC` fica próximo de 4,5:1. Evite usá-lo em texto de corpo sobre fundo `canvas` e confirme o contraste ao usá-lo em placeholders.
- Branco sobre `#2563EB` (botão primário) tem contraste aproximado de 5,2:1, adequado.

---

## 3. Dimensões e geometria

| Propriedade                                              | Valor                                                     | Status   |
| -------------------------------------------------------- | --------------------------------------------------------- | -------- |
| Altura padrão de campo (input, select, search, password) | `42px`                                                    | Oficial  |
| Border radius padrão                                     | `8px`                                                     | Oficial  |
| Espessura da borda                                       | `1px`                                                     | Oficial  |
| Contorno de foco                                         | `0 0 0 3px rgb(37 99 235 / 0.15)` (anel azul translúcido) | Oficial  |
| Padding horizontal interno de campo                      | `12px` (`px-3`)                                           | Estimado |
| Padding de card                                          | `20px` a `24px` (`p-5` / `p-6`)                           | Estimado |
| Raio de card                                             | `12px` (`rounded-xl`)                                     | Estimado |
| Espaço entre label e campo                               | `6px` (`mb-1.5`)                                          | Estimado |
| Espaço entre campo e mensagem de ajuda                   | `6px` (`mt-1.5`)                                          | Estimado |

- `42px` é a referência para **campos**. Botões, textareas e controles compactos podem ter dimensões próprias, desde que mantenham o raio, a borda e os estados.
- Textarea: altura livre com altura mínima equivalente a 2 linhas, padding interno de `12px`.
- Checkbox: quadrado de `16px` a `18px` com raio de `4px` (**Estimado**).

---

## 4. Estados dos campos

Matriz aplicada a inputs de texto, busca, senha, select e textarea. Todos com superfície `surface`, altura `42px` e raio `8px`, salvo onde indicado.

| Estado       | Borda                               | Fundo               | Texto   | Feedback adicional                                   | Status                           |
| ------------ | ----------------------------------- | ------------------- | ------- | ---------------------------------------------------- | -------------------------------- |
| **Default**  | `border` `#E2E8F0`                  | `surface` `#FFFFFF` | `text`  | Nenhum                                               | Oficial                          |
| **Hover**    | Levemente mais escura que `#E2E8F0` | `surface`           | `text`  | Nenhum                                               | Oficial (tom exato não definido) |
| **Focus**    | `primary` `#2563EB`                 | `surface`           | `text`  | Anel `0 0 0 3px rgb(37 99 235 / 0.15)`               | Oficial                          |
| **Success**  | `success` `#16A34A`                 | `surface`           | `text`  | Ícone de check à direita + mensagem verde abaixo     | Oficial                          |
| **Error**    | `error` `#DC2626`                   | `surface`           | `text`  | Ícone de alerta à direita + mensagem vermelha abaixo | Oficial                          |
| **Disabled** | `border`                            | `canvas` `#F8FAFC`  | `muted` | Cursor `not-allowed`; texto atenuado                 | Oficial                          |

### Detalhes

- **Hover:** a transição deve ser sutil e curta (`transition-colors`, cerca de 150ms). Proposta de tom para a borda de hover: `#CBD5E1` (`slate-300`), pois a referência não define o valor exato.
- **Focus:** nunca remova o indicador de foco. Use `focus-visible` quando o foco por mouse não precisar de anel, mas mantenha o anel para teclado.
- **Success e Error não dependem só de cor:** sempre acompanham ícone e texto. Mensagem de erro de campo fica abaixo do campo, em texto de tamanho `12px`.
- **Disabled:** campo bloqueado para edição. Use o atributo `disabled` no elemento, não apenas o visual.
- **Mensagens de ajuda** (neutras) usam `muted` e tamanho `12px`.

### Classes de referência (Tailwind)

Base de campo (**Aplicada** em `src/app/shared/styles/field.styles.ts`, equivalente à referência):

```text
h-crm-input w-full rounded-crm border border-crm-border bg-crm-surface px-3
text-sm text-crm-text placeholder:font-light placeholder:text-crm-muted outline-none
transition-colors hover:border-crm-border-hover
focus:border-crm-primary focus:shadow-crm-focus
disabled:cursor-not-allowed disabled:bg-crm-canvas disabled:text-crm-muted
aria-invalid:border-crm-error aria-invalid:shadow-none
```

Variante de sucesso: `border-crm-success`. Variante de erro: `aria-invalid:border-crm-error` com `aria-invalid="true"` no elemento.

---

## 5. Catálogo de componentes

Status: **Referência visual** (definido na imagem) · **Não implementado** (ainda não existe no projeto).

### 5.1 Campos de entrada

| Componente            | Comportamento e aparência                                                                                                                                                                            | Status                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Input de texto**    | Label dentro do campo como placeholder, com ícone do Material Symbols à esquerda conforme o tipo (e-mail: `mail`, senha: `lock`, busca: `search`); campo de `42px`; mensagem de ajuda ou erro abaixo | Implementado (`app-input`)                                                |
| **Campo de busca**    | Ícone de lupa à esquerda (padding esquerdo ~`36px`), placeholder descritivo, atalho de teclado à direita (ex.: `⌘K` em badge `muted` com borda `border`)                                             | Implementado (`app-input`, `type="search"`); atalho `⌘K` não implementado |
| **Campo de senha**    | Ícone de cadeado à esquerda; botão de olho à direita para exibir/ocultar; `type` alterna entre `password` e `text`; botão com `aria-label` e `aria-pressed`                                          | Implementado (`app-input`, `type="password"`)                             |
| **Select / Dropdown** | Campo de `42px` com chevron à direita; seta customizada (não o select nativo sem estilo); `<select>` nativo estilizado é preferível para acessibilidade                                              | Implementado (`app-select`)                                               |
| **Textarea**          | Padding `12px`, altura mínima de 2 linhas, redimensionável verticalmente. Contador de caracteres (`124 / 500`) alinhado à direita, na mesma linha do label                                           | Implementado (`app-textarea`, com `maxLength`)                            |

### 5.2 Caixas de seleção (checkbox)

- Não marcado: quadrado branco, borda `border` (ou `slate-300` para melhor visibilidade do controle).
- Marcado: quadrado `primary` com ícone de check branco.
- Label à direita, com descrição auxiliar em `muted`, `12px`, abaixo do label.
- Desabilitado: opacidade reduzida, label e descrição em `muted`, cursor `not-allowed`.
- Agrupe checkboxes relacionados com `<fieldset>` e `<legend>`.
- Status: **Implementado** (`app-checkbox`).

### 5.3 Botões

| Variante             | Aparência                                                                                                                                                | Status                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Primário             | Fundo `primary`, texto branco, hover `primary-hover`, raio `8px`, altura `42px`                                                                          | Implementado (`app-button`, `variant="primary"`)   |
| Secundário           | Fundo `surface`, borda `border`, texto `text`, hover `canvas`                                                                                            | Implementado (`app-button`, `variant="secondary"`) |
| Destrutivo           | Fundo `error`, texto branco, hover `error-hover` (`#B91C1C`)                                                                                             | Implementado (`app-button`, `variant="danger"`)    |
| Contorno (`outline`) | Sem fundo, borda `1px` branca, texto branco, hover `bg-white/10`; anel de foco branco. Para fundos escuros (tela de login). Usa `white`, fora dos tokens | Implementado (`app-button`, `variant="outline"`)   |

Interação (todas as variantes): cursor `pointer`; no hover, o botão sobe `1px` com sombra suave (`shadow-md`) e volta ao ser pressionado (`active`), com transição de `200ms`. Sem movimento com `prefers-reduced-motion`. Os botões internos de ícone (X do modal e do painel, olho da senha) também usam cursor `pointer`.

Estado `disabled`: opacidade de `60%` e cursor `not-allowed`. Desabilitado não sobe nem ganha sombra. Com o botão de cadastro desabilitado, o azul primário perde força; isso é o comportamento compartilhado.

### 5.4 Demais componentes (padrões a seguir quando forem criados)

| Componente             | Diretriz                                                                                                                                                                                                                       | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cards e painéis        | Fundo `surface`, borda `border`, raio `12px`, sombra suave (`shadow-sm`) quando necessário                                                                                                                                     | Implementado (`app-card`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Tabelas de dados       | Cabeçalho em caixa-alta, `12px`, `muted`; linhas com divisor `border`; hover `canvas`                                                                                                                                          | Não implementado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Modais                 | Overlay escuro translúcido, card `surface`, foco preso no modal, fechamento com `Esc`. Variante `end` (painel lateral, não modal): sem overlay escuro, sem chrome e sem bloquear a página; o conteúdo traz o próprio cabeçalho | Implementado (`app-modal`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Badges de status       | Fundo `light` ou tom suave da cor semântica, texto da cor correspondente, raio `full`                                                                                                                                          | `app-badge` (`tone`: `neutral`, `primary`, `error`, `success`) para status de projeto e de tarefa; tom do status de projeto em `PROJECT_STATUS_TONE` (`core/models`). Barra de andamento: `app-progress-bar`. Os selos de prioridade do quadro ainda usam classes próprias. Prioridade (`alta` `bg-crm-error/10 text-crm-error`, `média` `bg-crm-primary/10 text-crm-link`, `baixa` `bg-crm-canvas text-crm-muted`) e status de projeto (`em andamento` azul, `pausado` vermelho, `concluído` `bg-crm-success/10 text-crm-success-text`, `planejamento` neutro). O texto sempre acompanha a cor |
| Alertas / notificações | Fundo suave da cor semântica, ícone, texto; `role="alert"` para erros                                                                                                                                                          | Parcial (login usa `role="alert"`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Tooltips               | Aparecem em hover e foco; texto curto; nunca contêm ação essencial                                                                                                                                                             | Proposta                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Paginação              | Botões com estados `disabled` nas extremidades; página atual em `primary`                                                                                                                                                      | Proposta                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Estado vazio           | Texto `muted` centralizado, ícone opcional, ação de criação quando aplicável                                                                                                                                                   | Parcial (home: "Nenhuma tarefa" por coluna, "Nenhum projeto cadastrado.", "Nenhum membro na equipe.")                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Carregamento           | **Skeleton obrigatório** em páginas que carregam dados: `app-skeleton` no formato do conteúdo, num contêiner `role="status"` com texto `sr-only`. Sem texto "Carregando..." solto. Botões em espera usam `loading`             | Implementado (`app-skeleton`; home)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

---

### 5.5 Componentes compartilhados (implementados)

Código em `src/app/shared/`. Importe pelo ponto de entrada, nunca pelos arquivos internos:

```ts
import { Button, Card, Input, Modal } from '../../shared';
```

| Componente           | Seletor          | Principais entradas                                                                                                                                                                                                                                                                                 | Observações                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button               | `app-button`     | `variant` (`primary`, `secondary`, `danger`, `outline`), `type`, `loading`, `disabled`, `fullWidth`, `iconOnly` (quadrado, só ícone), `ariaLabel`                                                                                                                                                   | `loading` bloqueia o botão e marca `aria-busy`; com `iconOnly`, `ariaLabel` é obrigatório                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Input                | `app-input`      | `id`, `label`, `type` (`text`, `email`, `password`, `search`, `tel`, `url`, `number`), `placeholder`, `autocomplete`, `hint`, `error`, `success`, `disabled`                                                                                                                                        | Ícone à esquerda pelo `type` (ou `icon`); `placeholder` padrão é o `label`; senha ganha botão de exibir/ocultar; erro e sucesso ganham ícone à direita; método `focus()`                                                                                                                                                                                                                                                                                                                                                                                                          |
| Select               | `app-select`     | `id`, `label`, `options` (`SelectOption[]`), `placeholder`, `hint`, `error`, `success`, `disabled`                                                                                                                                                                                                  | Valor é `string`; seta customizada                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Textarea             | `app-textarea`   | `id`, `label`, `rows`, `maxLength` (mostra contador), `placeholder`, `hint`, `error`, `success`, `disabled`                                                                                                                                                                                         | Redimensionável na vertical                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Checkbox             | `app-checkbox`   | `label`, `description`, `disabled`                                                                                                                                                                                                                                                                  | Valor é `boolean`; label clicável                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Card                 | `app-card`       | `title`, `padded`, `fill`                                                                                                                                                                                                                                                                           | Conteúdo projetado. Com `fill`, o card ocupa a altura do contêiner e o corpo vira coluna flexível: o conteúdo usa `min-h-0 flex-1 overflow-y-auto` (mais `relative` e `tabindex="0"`) para rolar dentro do card. Usado na home em tela cheia                                                                                                                                                                                                                                                                                                                                      |
| Painel de formulário | `app-form-panel` | `title`, `form` (`FormGroup`), `fields` (`FormPanelField[]`: `name`, `label`, `type`, `options`, `errors`), `submitLabel` (padrão `Salvar`), `loading`, `status` (texto verde, `role="status"`), `error` (texto `error`, `role="alert"`); eventos `submitted` (só com formulário válido) e `closed` | Título, campos gerados pela configuração, conteúdo extra projetado entre os campos e o botão (ex.: link), botão de salvar no fim e X de fechar no canto superior direito. Quando título e campos mudam, o cartão anima a altura e o conteúdo faz fade (sem animação com movimento reduzido)                                                                                                                                                                                                                                                                                       |
| Skeleton             | `app-skeleton`   | `shape` (`block` raio `8px`, `text`, `circle`); tamanho pelas classes do host (ex.: `class="h-4 w-24"`)                                                                                                                                                                                             | Cor `border` (acompanha o tema), `animate-pulse`, parado com movimento reduzido; `aria-hidden` (quem usa anuncia com `role="status"`)                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Sidebar              | `app-sidebar`    | `items` (`SidebarItem[]`: `label`, `icon`, `route`), `brand`, `userName`, `userRole`; evento `logout`                                                                                                                                                                                               | Flutuante à esquerda (`fixed top-4 bottom-4 left-4`, `rounded-2xl`, `surface`, `shadow-lg`, borda `card-border`). Recolhida (`w-16`): só ícones, nome no `title` e para leitores de tela. Expandida (`w-60`) pelo botão do topo (`aria-expanded`): rótulos, usuário e Sair. O host reserva a largura no layout (`w-20` recolhida, `md:w-64` expandida): numa página em `flex`, expandir empurra o conteúdo; abaixo de `md`, a expandida passa por cima. Item ativo: fundo `light`, texto `link`; hover `canvas`. Animação de largura de `300ms`, desligada com movimento reduzido |
| Link de texto        | `app-text-link`  | `to` (caminho do roteador); texto projetado                                                                                                                                                                                                                                                         | Cor `crm-link` (acompanha o tema), sublinhado no hover, anel de foco. Ex.: "Esqueci minha senha"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Modal                | `app-modal`      | `open` (obrigatório), `title`, `placement` (`center` padrão, ou `end`: painel **não modal** à direita, sem escurecer o fundo; a página continua clicável e o Tab não fica preso), evento `closed`                                                                                                   | Fecha com Esc, clique no fundo ou botão de fechar; prende o foco e o devolve ao fechar. Quem fecha é o pai, ao atualizar `open`. Abre com animação (`center` amplia; `end` desliza da direita); no `end`, a margem da direita é `48px` em `sm`+ e `96px` em `lg`+                                                                                                                                                                                                                                                                                                                 |

Campos (`input`, `select`, `textarea`, `checkbox`) implementam `ControlValueAccessor` e funcionam com `formControl` e `formControlName`.

`app-icon` é o ponto único dos ícones (Material Symbols, fonte variável carregada em `src/index.html`). Entradas: `name` (ligature, como `mail`), `size` (`sm` 16px, `md` 20px padrão, `lg` 24px), `weight` (`thin`, `light` padrão, `regular`, `medium`) e `filled`. A cor vem do texto do pai. A fonte carrega **só** os ícones de `IconName` (parâmetro `icon_names`, ≈ 11 kB): ícone novo entra no tipo e na URL, em ordem alfabética. Auxiliar interno: `app-field-message` (mensagem de erro, sucesso ou ajuda).

---

## 6. Tipografia

- **Família:** a referência parece usar uma sans-serif moderna (aparência próxima de Inter). **O projeto não carrega fonte customizada**: usa a pilha padrão do Tailwind 4 (`ui-sans-serif, system-ui, …`). Não trocar sem decisão; se o time adotar Inter, deve ser feito de forma global (proposta).
- **Escala** (**Estimado**, mapeada às classes padrão do Tailwind):

| Papel                                         | Classe                                               | Tamanho | Peso                           |
| --------------------------------------------- | ---------------------------------------------------- | ------- | ------------------------------ |
| Título de página                              | `text-2xl`                                           | 24px    | `font-semibold` (600)          |
| Título de seção / card                        | `text-lg` ou `font-semibold`                         | 16–18px | `font-semibold`                |
| Eyebrow (rótulo de seção/tipo)                | `text-[11px]` ou `text-xs` `uppercase tracking-wide` | 11–12px | `font-semibold`, cor `primary` |
| Label de campo                                | `text-sm`                                            | 14px    | `font-medium`, `text`          |
| Texto de campo                                | `text-sm`                                            | 14px    | `font-normal`, `text`          |
| Texto de apoio (descrição, mensagem de ajuda) | `text-xs`                                            | 12px    | normal, `muted`                |
| Métricas / valores de destaque                | `text-2xl`                                           | 24px    | `font-semibold`                |

- Mantenha contraste mínimo de 4,5:1 para texto de corpo e 3:1 para textos grandes.
- Evite mais de 3 pesos tipográficos na mesma tela.
- Títulos em `text`; descrições em `muted`. Não use cor azul para texto de corpo.

---

## 7. Espaçamento e densidade

- Use a escala de espaçamento do Tailwind (múltiplos de 4px). Evite valores arbitrários de espaçamento.
- Entre label, campo e mensagem: `6px`.
- Entre campos de um formulário: `16px` a `20px` (`space-y-4` / `space-y-5`).
- Entre seções de página: `24px` (`space-y-6`).
- Telas de gestão de dados (tabelas, listas) devem ser densas: linhas de `40px`–`48px`, texto `14px`.

---

## 8. Implementação dos tokens (Tailwind CSS 4)

O projeto usa **Tailwind CSS 4.3**, que **não tem `tailwind.config.js`** por padrão. Os tokens são declarados em CSS, dentro de `src/styles.css`, logo após `@import 'tailwindcss';`.

**Status:** **Aplicada** em `src/styles.css`. Além dos tokens originais, foram adicionados `border-hover`, `error-hover`, `success-text` e `shadow-crm-error-focus`, usados pelos componentes de campo. Na frase da tela de autenticação, a troca de texto faz um rolamento 3D (`rotateX` com perspectiva, 600 ms), via `animateElement` de `shared/motion`. Há um único bloco `@theme`; não crie um segundo.

```css
@import 'tailwindcss';

@theme {
  --color-crm-primary: #2563eb;
  --color-crm-primary-hover: #1d4ed8;
  --color-crm-light: #eff6ff;
  --color-crm-canvas: #f8fafc;
  --color-crm-surface: #ffffff;
  --color-crm-text: #0f172a;
  --color-crm-muted: #64748b;
  --color-crm-border: #e2e8f0;
  --color-crm-border-hover: #cbd5e1;
  --color-crm-error: #dc2626;
  --color-crm-error-hover: #b91c1c;
  --color-crm-success: #16a34a;
  --color-crm-success-text: #15803d;

  --height-crm-input: 42px;
  --radius-crm: 8px;
  --shadow-crm-focus: 0 0 0 3px rgb(37 99 235 / 0.15);
  --shadow-crm-error-focus: 0 0 0 3px rgb(220 38 38 / 0.15);
}
```

Com isso, as classes `bg-crm-primary`, `h-crm-input`, `rounded-crm`, `shadow-crm-focus` e as demais ficam disponíveis.

A seção 5 da imagem de referência ("Configuração e Classes Tailwind CSS") usa `tailwind.config.js` e `module.exports`, que é sintaxe do Tailwind 3. Não copie esse trecho: use a abordagem `@theme` acima. As classes utilitárias da imagem (`border-[#E2E8F0]`, `focus:shadow-[...]` etc.) podem ser substituídas pelos tokens equivalentes.

Regras:

- Não criar `tailwind.config.js` para isto: o Tailwind 4 usa `@theme`.
- Não copiar valores para `styles.css` como classes soltas: use os tokens.
- Mudar um token afeta a aplicação inteira. Só altere com justificativa no resumo da tarefa.

---

### 8.1 Tema escuro (variáveis por escopo)

O escuro é **preto e cinzas neutros, sem tom azul**. O azul fica só como destaque (`primary`, `link`, foco, detalhes da cena 3D).

**Status:** **Aplicado** no app inteiro (autenticação e home). Os valores escuros são **Proposta** (a referência não define tema escuro).

O tema escuro **não** usa classes `dark:` nos componentes. Em `src/styles.css`, o seletor `[data-theme='dark']` redefine os mesmos tokens com valores escuros (e `color-scheme: dark`). Todo componente que usa tokens (`app-form-panel`, `app-input`, `app-select`, `app-button` secundário, `app-modal`) muda sozinho dentro desse escopo. O `ThemeService` aplica `data-theme` no `<html>`, então o tema vale para o app inteiro. O botão de alternância fica no shell (`App`), fixo no canto superior direito de todas as telas (`z-40`, abaixo dos modais).

| Token                                                                              | Claro                 | Escuro                           |
| ---------------------------------------------------------------------------------- | --------------------- | -------------------------------- |
| `surface`                                                                          | `#FFFFFF`             | `#141414`                        |
| `canvas`                                                                           | `#F8FAFC`             | `#0A0A0A`                        |
| `text`                                                                             | `#0F172A`             | `#FAFAFA`                        |
| `muted`                                                                            | `#64748B`             | `#A3A3A3`                        |
| `border` / `border-hover`                                                          | `#E2E8F0` / `#CBD5E1` | `#262626` / `#3A3A3A`            |
| `card-border` (borda externa de `app-form-panel`, `app-card` e modal centralizado) | `#E2E8F0`             | `transparent` (cartão sem borda) |
| `light`                                                                            | `#EFF6FF`             | `#262626`                        |
| `link` (`app-text-link`)                                                           | `#2563EB`             | `#60A5FA`                        |
| `error` / `error-hover`                                                            | `#DC2626` / `#B91C1C` | `#EF4444` / `#DC2626`            |
| `success` / `success-text`                                                         | `#16A34A` / `#15803D` | `#22C55E` / `#4ADE80`            |
| `primary` / `primary-hover`                                                        | `#2563EB` / `#1D4ED8` | sem mudança                      |

Regras:

- Para um componente funcionar nos dois temas, use **só tokens** (`bg-crm-surface`, `text-crm-text`...). Cores fixas (`text-white`, `bg-black`) não acompanham o tema.
- Erro e sucesso ficam mais claros no escuro para manter contraste de texto. Botão `danger` (texto branco sobre `#EF4444`) tem contraste ≈ 3,8:1 no escuro; ainda não é usado nesse tema.
- A home segue o tema, inclusive os selos de prioridade e de status (tokens com opacidade). A home não tem barra no topo; a navegação é a sidebar flutuante, e a página ocupa a tela inteira ao lado dela (ver `ARCHITECTURE.md`, seção 4.1).

---

## 9. Aderência atual do código à referência

Comparação feita durante a análise. **Não corrigir sem tarefa específica** — estas são lacunas a tratar.

| Local                                                               | Situação atual                                                                                                                                                                                                                                                                                                                                                                     | Referência                                                | Ação recomendada                                                                                                                                                          |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `features/auth/pages/auth-page/auth-page.html` — cor primária       | Tokens `crm-primary` e `crm-primary-hover`                                                                                                                                                                                                                                                                                                                                         | `primary` / `primary-hover`                               | **Migrado**                                                                                                                                                               |
| `features/home/pages/home-page/home-page.html` — logo e avatar      | `bg-crm-primary`                                                                                                                                                                                                                                                                                                                                                                   | `primary`                                                 | **Migrado**                                                                                                                                                               |
| `features/auth/components/auth-form/` — campos                      | `app-form-panel` com `app-input` (altura `42px`, anel de foco da referência)                                                                                                                                                                                                                                                                                                       | Seção 4                                                   | **Migrado** para `app-input` via `app-form-panel`                                                                                                                         |
| `features/auth/pages/auth-page/auth-page.html` — botões             | `app-button`: Cadastrar `primary`, Entrar `outline`                                                                                                                                                                                                                                                                                                                                | Seção 5.3                                                 | **Migrado** para `app-button`                                                                                                                                             |
| `features/auth/pages/auth-page/auth-page.html` — card do formulário | Removido a pedido. O cadastro usa `app-modal` (`placement="end"`) com `app-form-panel`                                                                                                                                                                                                                                                                                             | Seção 5.4                                                 | **Atualizado**: o card de login saiu da tela; formulários novos usam `app-form-panel`                                                                                     |
| `features/auth/pages/auth-page/auth-page.html` — fundo              | Tema escuro (padrão) ou claro, alternado no botão fixo do shell (`ThemeService`). Claro: fundo `canvas`, cubos `surface`, chão `border`, gradiente `canvas`, texto `text`, botão Entrar `secondary`. Escuro: cenário 3D escuro (Three.js, `features/auth/components/city-scene/`) com gradiente preto na base (`bg-black`, `from-black/85`); textos `text-white` e `text-white/70` | Fundo `canvas` `#F8FAFC`                                  | **Exceção de tela cheia** introduzida na atualização do login; cores do cenário são os tokens `primary`, `light` e `text` em hexadecimal. Confirmar com o time (seção 12) |
| `features/home/pages/home-page/home-page.html` — fundo e cards      | `bg-crm-canvas`; cards com `app-card`                                                                                                                                                                                                                                                                                                                                              | `canvas`; raio `12px`, superfície `surface`, sombra suave | **Migrado**                                                                                                                                                               |
| Textos                                                              | `text-crm-text`, `text-crm-muted`                                                                                                                                                                                                                                                                                                                                                  | `text`, `muted`                                           | **Migrado**                                                                                                                                                               |
| Mensagens de erro                                                   | `text-crm-error`                                                                                                                                                                                                                                                                                                                                                                   | `error`                                                   | **Migrado**                                                                                                                                                               |
| Status de sucesso                                                   | Disponível em `app-input`, `app-select` e `app-textarea` (`success`)                                                                                                                                                                                                                                                                                                               | Verde com ícone e texto                                   | Usar nas telas novas                                                                                                                                                      |
| Selos de prioridade e status (home)                                 | `PRIORITY_CLASSES` (`task-card.ts`) e `PROJECT_STATUS_CLASSES` (`home-page.ts`), com tokens semânticos a 10% de opacidade                                                                                                                                                                                                                                                          | Não definida na referência                                | **Proposta**: confirmar com o time (seção 12, item 7). A paleta de etapas do funil (`STAGE_STYLES`) saiu junto com a tela de CRM                                          |
| Tokens em CSS                                                       | Um único bloco `@theme` em `src/styles.css`                                                                                                                                                                                                                                                                                                                                        | Seção 8                                                   | **Migrado**                                                                                                                                                               |

Como as telas usam classes utilitárias diretamente, a migração deve ser feita **por componente**, não por busca e substituição global de `indigo`.

---

## 10. Responsividade

- Mobile first: layouts de uma coluna por padrão; expandir com `sm:`, `md:`, `lg:`.
- Formulários devem caber em telas de `320px` sem rolagem horizontal, com margens laterais de `16px`.
- Campos ocupam a largura total em telas estreitas. Dois campos lado a lado só a partir de `sm:`.
- Áreas de toque: no mínimo `40px` de altura (`42px` para campos).
- Tabelas: em telas estreitas, usar rolagem horizontal dentro do próprio container (`overflow-x-auto`, como no quadro de tarefas da home) ou reorganizar em lista de cards. Não deixar a página inteira rolar horizontalmente.
- Teste sempre em largura de celular antes de encerrar uma tarefa de interface.

---

## 11. Acessibilidade

- Todo campo tem `<label>` associado. Placeholder **não** substitui label.
- Erros: `aria-invalid="true"` no campo e `aria-describedby` apontando para a mensagem. Mensagens de erro globais usam `role="alert"`.
- Foco visível em todos os controles interativos (anel de foco da seção 4).
- Navegação por teclado completa: ordem de tabulação lógica; `Enter` submete formulários; `Esc` fecha modais.
- Botões que só têm ícone exigem `aria-label`.
- Estados não dependem só de cor: sempre acompanham ícone ou texto.
- Respeite `prefers-reduced-motion`: transições longas ou animações devem ser desativadas nesse caso (`motion-reduce:transition-none`).
- Contraste: siga os tokens da seção 2 e as observações sobre verde de sucesso.

---

## 12. Lacunas e propostas em aberto

Itens que a referência não cobre. Não implementar como padrão sem decisão do time.

1. **Tom exato de hover da borda** — `#CBD5E1` aplicado como `crm-border-hover`; confirmar com a referência.
2. **Verde de texto de sucesso** — `#15803D` aplicado como `crm-success-text` para texto; `#16A34A` para bordas e ícones.
3. **Vermelho de hover para ação destrutiva** — `#B91C1C` aplicado como `crm-error-hover`.
4. **Fonte** — decidir entre a pilha padrão atual e Inter.
5. **Tela de login escura** — o login usa cenário 3D escuro com gradiente preto (exceção de tela cheia, em `features/auth/components/city-scene/`). Confirmar com o time se é definitivo ou se deve voltar ao `canvas`.
6. **Variante secundária de botão e modais** — definidas em linhas gerais; detalhar quando forem implementadas.
7. **Cores de prioridade e status** — a home usa tokens semânticos com opacidade de 10% (`bg-crm-error/10`, `bg-crm-primary/10`, `bg-crm-success/10`). O texto vermelho sobre o fundo vermelho a 10% fica perto de 4,3:1 no tema claro; validar o contraste e decidir se vira token próprio.

---

## 13. Organização e reutilização dos componentes visuais

- Cada componente visual fica em `src/app/shared/components/<nome>/`, com `<nome>.ts`, `<nome>.html` e `<nome>.spec.ts`. Ponto de entrada: `shared/index.ts`.
- Componentes visuais são `ChangeDetectionStrategy.OnPush`, não chamam serviços e não têm regra de negócio.
- Variações entram por entrada (`variant`, `error`, `success`, `disabled`), não por componentes duplicados.
- Mapas de classes ficam em constante no arquivo do componente (ex.: `VARIANT_CLASSES` em `button.ts`), e a combinação é feita em `computed`.
- Base comum dos campos: `shared/styles/field.styles.ts` (`FIELD_HEIGHT`, `fieldClasses`). Contrato de valor: `shared/forms/control-value.base.ts`.

## 14. Convenções de estilo: global e específico

- **Global** (`src/styles.css`): o `@import 'tailwindcss'`, o bloco `@theme`, o escopo `[data-theme='dark']` e a barra de rolagem da aplicação (`@layer base`: fina, trilho transparente, polegar `crm-border-hover`, `crm-muted` ao passar o mouse; fallback WebKit para Safari). Não há classes de componente nesse arquivo.
- **Específico**: classes Tailwind no template ou em constantes do componente. O projeto não usa arquivos `.css` por componente.
- Layout de página (grade, espaçamento entre seções, largura máxima) pode usar utilitários Tailwind na própria página. Cor, borda, raio, altura e sombra de elementos de interface vêm do componente e dos tokens.
- Valor arbitrário (`bg-[...]`, `h-[...]`) só em casos únicos e justificados. Se repetir, vira token.

## 15. Como adicionar um componente sem duplicar estilos

1. Procure em `shared/components/` um componente que já resolva o caso, talvez com outra variante.
2. Se não houver, crie `shared/components/<nome>/` seguindo a seção 13 e reaproveite a base de classes existente (`fieldClasses`, `FIELD_HEIGHT`) ou crie uma constante `BASE_CLASSES`, como em `button.ts`.
3. Implemente os estados da seção 4 (campos) ou da seção 5.3 (botões): `hover`, `focus-visible` com anel `shadow-crm-focus`, `disabled` com `cursor-not-allowed`, e `error`/`success` sempre com ícone e texto.
4. Exporte em `shared/index.ts`, acrescente a linha na tabela da seção 5.5 e escreva o `*.spec.ts`.
5. Use o componente nas telas. **Não** copie as classes para a página.

## 16. Como integrar novos elementos ao design system

- **Valor visual novo:** primeiro procure um token existente. Se nenhum servir, proponha o token nas seções 2 e 8 (`@theme`) com justificativa no resumo da tarefa, porque token é compartilhado por todo o app.
- **Estado novo:** registre na matriz da seção 4 e aplique a todos os componentes do mesmo tipo.
- **Cor de categoria** (ex.: etapas do funil): é lacuna (seção 12, item 7). Não escolha uma paleta nova sem decisão do time.
- Ao concluir, atualize este documento no mesmo trabalho e a seção 9 se a tela migrou.
