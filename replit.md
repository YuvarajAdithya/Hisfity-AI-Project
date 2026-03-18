# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: Google Gemini (via Replit AI Integrations, `@workspace/integrations-gemini-ai`)

## Project: Histify

Histify is an AI-powered history learning platform. Users enter any history topic, choose a learning level (Beginner/Intermediate/Advanced), and get an AI-generated structured lesson with a quiz and history of past searches.

### Features
- AI-generated history lessons (title, overview, 3 sections, key facts, fun fact)
- Interactive 5-question multiple-choice quiz
- Quiz results with score, correct/wrong highlighting
- Search history with persistence
- Text-to-speech (Web Speech API) on lesson page
- Dark navy glassmorphism UI with red-pink accents

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   │   └── src/
│   │       ├── routes/
│   │       │   ├── lessons/ # POST /lessons/generate, POST /lessons/quiz
│   │       │   └── history/ # GET /history, DELETE /history
│   │       └── lib/
│   │           └── gemini.ts # Gemini lesson/quiz generation
│   └── histify/            # React + Vite frontend (served at /)
│       └── src/
│           ├── pages/      # home, lesson, quiz, result, history
│           ├── store/      # Zustand state management
│           └── components/ # layout, navbar
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── integrations-gemini-ai/ # Gemini AI integration
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/
│           └── searchHistory.ts  # search_history table
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## API Routes

- `GET /api/healthz` — health check
- `POST /api/lessons/generate` — generate AI lesson `{ topic, level }`
- `POST /api/lessons/quiz` — generate quiz from lesson content
- `GET /api/history` — get all search history
- `DELETE /api/history` — clear all history

## Database

- Table: `search_history` (id, topic, level, created_at)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers
- Depends on: `@workspace/db`, `@workspace/api-zod`, `@workspace/integrations-gemini-ai`

### `artifacts/histify` (`@workspace/histify`)

React + Vite frontend served at `/`. Uses Zustand for state management, Framer Motion for animations, and Tailwind CSS for styling.

- Pages: home, lesson, quiz, result, history
- State: Zustand store persists lesson and quiz data across page navigation
- AI integration: calls backend to generate lessons and quizzes via Gemini

### `lib/integrations-gemini-ai` (`@workspace/integrations-gemini-ai`)

Replit AI Integrations package for Gemini. Uses `AI_INTEGRATIONS_GEMINI_BASE_URL` and `AI_INTEGRATIONS_GEMINI_API_KEY` env vars (auto-provisioned by Replit).

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

- `src/schema/searchHistory.ts` — search_history table

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`).

Run codegen: `pnpm --filter @workspace/api-spec run codegen`
