# CRM Dashboard — instruções para o Claude Code

Instruções completas de desenvolvimento estão em [docs/CLAUDE.md](docs/CLAUDE.md) e são importadas abaixo:

@docs/CLAUDE.md

Ao alterar qualquer interface (telas, componentes, estilos, classes Tailwind), consulte também [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md). Ele é a referência oficial de cores, dimensões, estados e padrões visuais.

Resumo rápido, para casos em que o documento completo não tiver sido lido:

- Stack: Angular 22 (standalone, signals, `inject()`), Tailwind CSS 4, TypeScript, dados mockados, locale pt-BR.
- Arquitetura: organização por `core/` (singletons), `shared/` (UI) e `features/<domínio>/` (telas). Antes de implementar qualquer funcionalidade, siga a seção 4 de [docs/CLAUDE.md](docs/CLAUDE.md) e leia [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Gere artefatos com `ng g`.
- Interface: use sempre os componentes de `src/app/shared/` (button, input, select, textarea, checkbox, card, modal). Não recrie esses elementos com classes nas telas.
- Antes de encerrar uma tarefa: `npm run build`, `npx ng test --watch=false` e `npx prettier --check` nos arquivos alterados.
- Não faça commit nem reverta alterações não commitadas sem pedido explícito.
