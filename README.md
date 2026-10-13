<div align="center">

# 🏙️ Nexus CRM

**Painel de gestão de projetos e tarefas feito com Angular 22 e Tailwind CSS 4.**

![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.186-000000?logo=threedotjs&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white)

</div>

---

## ✨ Funcionalidades

- 🔐 **Login com cena 3D** — uma cidade animada em Three.js no fundo da tela de entrada.
- 📊 **Painel inicial** — indicadores, quadro de tarefas, detalhes e comentários.
- 📁 **Projetos** — lista com progresso e página de detalhes de cada projeto.
- 🌗 **Tema claro e escuro** — alternância com um clique.
- ⚡ **Carregamento com skeleton** — sem telas em branco enquanto os dados chegam.
- ♿ **Acessível e responsivo** — navegação por teclado e layout a partir de 320 px.

> ℹ️ Os dados são **simulados (mocks)**. Ainda não há backend.

## 🚀 Começando

Pré-requisito: [Node.js](https://nodejs.org/) 22 ou superior.

```bash
git clone https://github.com/gaboel0/Nexus-CRM.git
cd Nexus-CRM
npm install
npm start
```

Abra **http://localhost:4200** e entre com:

| E-mail          | Senha    |
| --------------- | -------- |
| `admin@crm.com` | `123456` |

## 🛠️ Scripts

| Comando                     | O que faz                       |
| --------------------------- | ------------------------------- |
| `npm start`                 | Servidor de desenvolvimento     |
| `npm run build`             | Build de produção em `dist/`    |
| `npx ng test --watch=false` | Testes unitários (Vitest)       |
| `npx prettier --check src`  | Verifica a formatação do código |

## 🗂️ Estrutura

```text
src/app/
├── core/       # serviços, guards, modelos e mocks
├── shared/     # componentes de UI reutilizáveis
└── features/   # telas por domínio
    ├── auth/       # login + cena 3D
    ├── home/       # painel e tarefas
    └── projects/   # lista e detalhes de projetos
```

## 📚 Documentação

- [Arquitetura](docs/ARCHITECTURE.md) — camadas, rotas e decisões técnicas.
- [Design System](docs/DESIGN-SYSTEM.md) — cores, componentes e padrões visuais.
- [Guia de desenvolvimento](docs/CLAUDE.md) — convenções e boas práticas.

---

<div align="center">
Feito com ☕ por <a href="https://github.com/gaboel0">gaboel0</a>
</div>
