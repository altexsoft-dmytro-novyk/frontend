# React Starter

A clean starter for a new project.

## Stack

- **Build**: Vite 8
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix UI), Lucide icons
- **Routing**: React Router v7
- **Data Fetching**: TanStack Query + Axios
- **i18n**: i18next / react-i18next (English)
- **Tests**: Playwright (e2e)
- **Code quality**: ESLint + Prettier

## Quick Start

```bash
npm install
npm run dev
```

Optional: copy `.env.example` to `.env` and fill in the values (defaults work without `.env`).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type check + production build |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Type check without build |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm run test` | Playwright e2e tests |
| `npm run test:ui` | Playwright UI mode |

## Structure

```
src/
  api/          # Axios client
  components/   # Reusable components (AppLayout, MainLayout, MainHeader, SideMenu, ui)
  config/       # Environment configuration (env.ts)
  contexts/     # React contexts (LayoutContext)
  hooks/        # Global hooks
  i18n/         # i18next configuration
  lib/          # shadcn utils (cn)
  locales/      # Translations
  pages/        # Pages (HomePage, ErrorPage)
  router/       # Router configuration
e2e/            # Playwright tests
```

Project conventions live in [CLAUDE.md](./CLAUDE.md) and the rules in [.claude/rules/](./.claude/rules/) — Claude Code loads them automatically when working with matching files.

## Adding UI Components

```bash
npx shadcn@latest add [component-name]
```
