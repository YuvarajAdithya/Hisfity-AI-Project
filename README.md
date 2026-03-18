# Histify — AI-Powered History Learning Platform

Histify is a full-stack web application where you enter any history topic, choose your learning level (Beginner, Intermediate, or Advanced), and instantly receive a structured AI-generated lesson complete with an interactive quiz. All your searches are saved so you can revisit past lessons anytime.

---

## Live Demo

Hosted on Replit — visit the deployed app at your `.replit.app` URL.

---

## Features

- **AI Lesson Generation** — Enter any topic (e.g. "World War 2", "Ancient Rome") and get a full structured lesson with title, overview, 3 detailed sections, key facts, and a fun fact
- **Difficulty Levels** — Choose Beginner, Intermediate, or Advanced to tailor the depth of content
- **Interactive Quiz** — 5 multiple-choice questions auto-generated from your lesson with instant scoring
- **Quiz Results** — Detailed results page showing correct/incorrect answers and your score
- **Text-to-Speech** — "Read Aloud" button reads your lesson out loud using the browser's Speech API
- **Search History** — Every lesson you generate is saved and browsable, with the ability to clear history
- **Responsive Design** — Works on desktop and mobile with a dark navy glassmorphism aesthetic

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| State Management | Zustand |
| Backend | Node.js + Express 5 + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| AI | Google Gemini 2.0 Flash (via Replit AI Integrations) |
| Monorepo | pnpm workspaces |
| API Contract | OpenAPI 3.0 spec with auto-generated React Query hooks and Zod schemas |

---

## Project Structure

```
histify/
├── artifacts/
│   ├── api-server/                  # Express 5 backend
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── routes/
│   │       │   ├── index.ts         # Route registry
│   │       │   ├── lessons/
│   │       │   │   └── index.ts     # POST /api/lessons/generate
│   │       │   │                    # POST /api/lessons/quiz
│   │       │   └── history/
│   │       │       └── index.ts     # GET /api/history
│   │       │                        # DELETE /api/history
│   │       └── lib/
│   │           └── gemini.ts        # Gemini AI lesson + quiz generation
│   │
│   └── histify/                     # React + Vite frontend
│       ├── index.html
│       ├── package.json
│       ├── components.json          # shadcn/ui config
│       └── src/
│           ├── App.tsx              # Router setup (5 routes)
│           ├── main.tsx
│           ├── index.css            # Dark navy glassmorphism theme
│           ├── pages/
│           │   ├── home.tsx         # Topic input + level selector
│           │   ├── lesson.tsx       # Lesson display + TTS
│           │   ├── quiz.tsx         # Interactive quiz
│           │   ├── result.tsx       # Score + answer review
│           │   ├── history.tsx      # Past searches
│           │   └── not-found.tsx    # 404 page
│           ├── store/
│           │   └── use-app-store.ts # Zustand global state
│           ├── components/
│           │   ├── layout.tsx       # Navbar + page wrapper
│           │   └── ui/              # shadcn/ui components
│           ├── hooks/
│           │   ├── use-toast.ts
│           │   └── use-mobile.tsx
│           └── lib/
│               ├── utils.ts
│               └── store.ts
│
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml             # OpenAPI 3.0 — single source of truth
│   ├── api-client-react/            # Auto-generated React Query hooks
│   ├── api-zod/                     # Auto-generated Zod validation schemas
│   ├── db/
│   │   └── src/schema/
│   │       ├── searchHistory.ts     # Search history table (Drizzle ORM)
│   │       └── index.ts
│   └── integrations-gemini-ai/      # Gemini AI client wrapper
│       └── src/
│           ├── client.ts            # Chat completions client
│           ├── index.ts
│           ├── batch/               # Batch processing helpers
│           └── image/               # Image generation client
│
├── scripts/                         # Build/codegen scripts
├── package.json                     # Workspace root
├── pnpm-workspace.yaml
└── README.md
```

---

## API Reference

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `GET` | `/api/healthz` | — | Health check |
| `POST` | `/api/lessons/generate` | `{ topic: string, level: "Beginner"\|"Intermediate"\|"Advanced" }` | Generate an AI history lesson |
| `POST` | `/api/lessons/quiz` | `{ lesson: object }` | Generate a 5-question quiz from a lesson |
| `GET` | `/api/history` | — | Get all saved search history |
| `DELETE` | `/api/history` | — | Clear all search history |

### Example: Generate a Lesson

```bash
curl -X POST https://your-app.replit.app/api/lessons/generate \
  -H "Content-Type: application/json" \
  -d '{ "topic": "The French Revolution", "level": "Intermediate" }'
```

### Lesson Response Shape

```json
{
  "title": "The French Revolution",
  "overview": "...",
  "sections": [
    { "heading": "Causes", "content": "..." },
    { "heading": "Key Events", "content": "..." },
    { "heading": "Legacy", "content": "..." }
  ],
  "keyFacts": ["...", "..."],
  "funFact": "..."
}
```

---

## Database Schema

```sql
-- search_history table (PostgreSQL via Drizzle ORM)
CREATE TABLE search_history (
  id        SERIAL PRIMARY KEY,
  topic     TEXT NOT NULL,
  level     TEXT NOT NULL,
  lesson    JSONB NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

## Running on Replit (Recommended)

This project is designed to run on Replit with zero configuration:

1. **Fork** this Replit project
2. Click **Run** — the app starts automatically
3. Gemini AI is auto-configured via Replit AI Integrations (no API key needed)
4. PostgreSQL is auto-provisioned by Replit

That's it — no `.env` files, no manual setup.

---

## Running Locally

> You will need your own Gemini API key and a PostgreSQL database.

### Prerequisites

- Node.js 20+
- pnpm: `npm install -g pnpm`
- A PostgreSQL database (local or hosted e.g. Neon, Supabase)
- A Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/histify.git
cd histify

# 2. Install all dependencies
pnpm install

# 3. Create environment file
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/histify
AI_INTEGRATIONS_GEMINI_BASE_URL=https://generativelanguage.googleapis.com
AI_INTEGRATIONS_GEMINI_API_KEY=your_gemini_api_key_here
PORT=8080
```

```bash
# 4. Push the database schema
pnpm --filter @workspace/db run push

# 5. Start the API server (Terminal 1)
pnpm --filter @workspace/api-server run dev

# 6. Start the frontend (Terminal 2)
pnpm --filter @workspace/histify run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How the AI Generation Works

1. The frontend sends a `topic` and `level` to `POST /api/lessons/generate`
2. The Express server calls Gemini 2.0 Flash with a carefully structured prompt
3. Gemini returns a JSON lesson (title, overview, sections, keyFacts, funFact)
4. The lesson is saved to PostgreSQL and returned to the frontend
5. When the user clicks "Take Quiz", the lesson content is sent to `POST /api/lessons/quiz`
6. Gemini generates 5 multiple-choice questions specific to that lesson
7. The frontend shows the quiz, grades answers, and displays results

---

## License

MIT — free to use, modify, and distribute.
#   H i s f i t y - A I - P r o j e c t  
 