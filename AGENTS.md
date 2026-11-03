# AGENTS.md — Universal Agent Workspace Standards for ClassBuddy

This document defines the authoritative, cross-tool standards and instructions for AI agents working within the **ClassBuddy** repository. All autonomous and paired AI agents must adhere to these conventions.

---

## 1. Project Overview & Tech Stack

ClassBuddy is a full-stack educational and classroom management platform featuring a dual-role interface (Educator & Student), an RFC 7636 PKCE OAuth 2.0 authorization server, LangGraph/LangChain multi-agent workflows, real-time WebSocket messaging backed by Redis Pub/Sub, and monetization via Razorpay.

The repository is organized as a decoupled monorepo containing a frontend client and backend server.

### 1.1 Frontend Client (`/client`)
- **Framework & Language:** React 18.3 (`^18.3.1`) + TypeScript 5.8 (`~5.8.3`)
- **Bundler & Tooling:** Vite 7.1 (`^7.1.2`), `@vitejs/plugin-react`
- **Styling:** Tailwind CSS 4.1 (`^4.1.12`), `@tailwindcss/vite`
- **UI Primitives:** Radix UI (`@radix-ui/react-*`), Lucide React (`lucide-react`)
- **State Management:** Redux Toolkit 2.8 (`^2.8.2`), `react-redux` 9.2, `redux-persist` 6.0
- **Routing:** React Router DOM 7.8 (`^7.8.1`)
- **Network & Real-Time:** Axios 1.11, Server-Sent Events (SSE) AI streaming (`useAIStream`), Razorpay Checkout SDK
- **Package Manager:** `npm` (`package-lock.json`)

### 1.2 Backend Server (`/server`)
- **Framework & Language:** FastAPI 0.136 (`>=0.136.3`), Python 3.14 (`requires-python = ">=3.14"`), Uvicorn 0.49
- **Database & ORM:** PostgreSQL (NeonDB), SQLAlchemy 2.0 (`>=2.0.50`), Alembic 1.19 (`>=1.19.1`), `psycopg2-binary`
- **Package & Environment Manager:** `uv` (`uv.lock`, `pyproject.toml`) with fallback `requirements.txt`
- **Cache & Pub/Sub:** Redis 8.0 (`redis>=8.0.0`) for distributed WebSocket synchronization
- **Multi-Agent AI:** LangGraph & LangChain 1.3 (`langchain>=1.3.6`), `langchain-google-genai` (Gemini 2.5 Flash), `langchain-tavily` (Tavily Search API), `langchain-groq`
- **Authentication & Security:** Custom OAuth 2.0 PKCE Authorization Server, PyJWT 2.13, `python-jose[cryptography]`, `bcrypt>=5.0.0`, `slowapi` rate limiter
- **Background Jobs:** Inngest 0.5 (`inngest>=0.5.18`)
- **Storage & Media:** Cloudinary 1.44 (`cloudinary>=1.44.2`)
- **Payments:** Razorpay SDK 2.0 (`razorpay>=2.0.1`)
- **Testing:** Pytest 9.1 (`pytest>=9.1.1`), `pytest-asyncio>=1.4.0`

### 1.3 Containerization
- `docker-compose.dev.yml` (Development stack with volume mounts and live reload)
- `docker-compose.prod.yml` (Production stack with Nginx static frontend and production ASGI)

---

## 2. Workflow Commands

Execute commands in their corresponding subdirectories (`/client` or `/server`).

### 2.1 Frontend (`client/`)
| Task | Command | Description |
| :--- | :--- | :--- |
| **Install Dependencies** | `cd client && npm install` | Install pinned npm packages |
| **Local Dev Server** | `cd client && npm run dev` | Run Vite dev server on `http://localhost:5173` |
| **Typecheck** | `cd client && npx tsc -b` | Strict TypeScript compilation check |
| **Production Build** | `cd client && npm run build` | Runs `tsc -b && vite build` |
| **Lint** | `cd client && npm run lint` | ESLint check across client code |
| **Preview Build** | `cd client && npm run preview` | Serve Vite production preview |

### 2.2 Backend (`server/`)
| Task | Command | Description |
| :--- | :--- | :--- |
| **Install Dependencies** | `cd server && uv sync` | Sync dependencies via uv |
| **Fallback Install** | `cd server && pip install -r requirements.txt` | Standard pip dependency install |
| **Run Database Migrations** | `cd server && uv run alembic upgrade head` | Apply latest Alembic migrations |
| **Local Dev Server** | `cd server && uv run uvicorn app.main:app --reload --port 8000` | Run FastAPI dev server on `http://127.0.0.1:8000` |
| **Syntax Verification** | `cd server && uv run python -m compileall -q app` | Bytecode compilation syntax check |
| **Run Pytest Suite** | `cd server && uv run pytest` | Execute pytest test runner |
| **Coverage Report** | `cd server && uv run pytest --cov=app tests/` | Run tests with coverage output |
| **Local Inngest Dev Server** | `npx inngest-cli@latest dev -u http://127.0.0.1:8000/api/inngest` | Simulate Inngest queues on `http://localhost:8288` |

### 2.3 Docker Compose
| Task | Command | Description |
| :--- | :--- | :--- |
| **Run Dev Stack** | `docker compose -f docker-compose.dev.yml up --build` | Full stack with live reloading |
| **Run Prod Stack** | `docker compose -f docker-compose.prod.yml up --build -d` | Optimized Nginx + Uvicorn container setup |
| **Stop Containers** | `docker compose -f docker-compose.dev.yml down` | Gracefully tear down local containers |

---

## 3. Code Style & Architectural Conventions

### 3.1 Project Layout
```text
ClassBuddy/
├── client/                     # Frontend Vite + React + TS SPA
│   ├── public/                 # Static assets, web manifests, robots.txt, _redirects
│   ├── src/
│   │   ├── components/         # Reusable UI widgets and primitives
│   │   │   ├── ui/             # Radix + Tailwind headless UI primitives
│   │   │   └── skeletons/      # Loading placeholder skeletons
│   │   ├── helper/             # Axios instance, PKCE utilities, SSE streaming
│   │   ├── hooks/              # Custom React hooks (e.g., useAIStream)
│   │   ├── lib/                # Shared utilities (clsx, tw-merge)
│   │   ├── page/               # Route views (Home, ChatDashboard, Dashboard, Teacher)
│   │   ├── redux/              # Redux store & domain slices (slice/*.ts)
│   │   ├── routes/             # Route configurations & role protection guards
│   │   ├── services/           # External API endpoints communication
│   │   └── types/              # Domain interfaces and DTOs
│   ├── package.json
│   └── vite.config.ts
├── server/                     # FastAPI backend application
│   ├── alembic/                # Migration scripts and environment configuration
│   ├── app/
│   │   ├── ai/                 # Multi-agent LangGraph workflows (notes, interview, industry)
│   │   ├── api/v1/             # API v1 routes & endpoints
│   │   │   └── endpoints/      # Domain routers (auth, oauth, teacher, group, ai, etc.)
│   │   ├── config/             # Database connection, settings, env loaders
│   │   ├── core/               # Logging and rate-limiting middleware
│   │   ├── dependencies/       # FastAPI dependency injection (OAuth & Teacher guards)
│   │   ├── inngest/            # Event-driven background task handlers
│   │   ├── models/             # SQLAlchemy ORM declarative models
│   │   ├── schemas/            # Pydantic request & response schemas
│   │   ├── services/           # Core domain business logic
│   │   ├── utils/              # Redis socket manager, Cloudinary, JWT & PKCE helpers
│   │   └── main.py             # FastAPI app lifespan, CORS & exception handlers
│   ├── pyproject.toml
│   └── uv.lock
├── docker-compose.dev.yml
└── docker-compose.prod.yml
```

### 3.2 Path Aliases & Imports
- **Frontend:** Use `@/*` pointing to `client/src/*` (configured in both `vite.config.ts` and `tsconfig.json`).
  - Example: `import { Button } from "@/components/ui/button";`
  - Example: `import { useAppDispatch } from "@/redux/store";`
- **Backend:** Use absolute imports rooted at `app.*`.
  - Example: `from app.core.logger import logger`
  - Example: `from app.schemas.auth import UserCreate`

### 3.3 Naming Conventions
- **React Components & Pages:** `PascalCase.tsx` (e.g., `AssignmentLists.tsx`, `THome.tsx`, `OAuthCallback.tsx`).
- **React Hooks:** `camelCase.ts` prefixed with `use` (e.g., `useAIStream.ts`, `useJoinToGroup.tsx`).
- **Redux Slices & Utilities:** `camelCase.ts` (e.g., `authSlice.ts`, `axios.ts`, `pkce.ts`).
- **Python Backend Modules:** `snake_case.py` (e.g., `oauth_service.py`, `socket_manager.py`). Existing legacy router files (e.g., `groupMessage.py`, `teacherInsight.py`) should retain their established names unless refactored across all imports.
- **Python Models & Schemas:** Classes in `PascalCase` (e.g., `TeacherInsight`, `AssignmentCreate`, `TokenResponse`).

### 3.4 State Management & API Pattern
- **Redux Toolkit:** All global client state (session auth, group messages, student dashboard data, teacher state) must be handled via domain slices in `client/src/redux/slice/`.
- **Axios Helper:** API calls must route through the configured helper (`client/src/helper/axios.ts`) which manages credentials and withCredentials headers for `HttpOnly` cookie forwarding.
- **Streaming:** Token-by-token LLM completions must use `useAIStream` over SSE endpoints.

---

## 4. Testing & Verification Standards

Before completing or committing any modification, agents **MUST** run the applicable verification checks:

1. **Frontend Verification Gate:**
   - Run `cd client && npx tsc -b`. **Zero TypeScript errors permitted.**
   - Run `cd client && npm run build` to ensure the production bundle builds cleanly.
2. **Backend Verification Gate:**
   - Run `cd server && uv run python -m compileall -q app` to guarantee syntax validity across all Python files.
   - If tests exist or new tests are authored, run `cd server && uv run pytest`.
3. **Database Migration Consistency:**
   - Any modification to SQLAlchemy models in `server/app/models/` requires a corresponding Alembic migration script in `server/alembic/versions/`.

---

## 5. Hard Guardrails (Strict DO NOT Rules)

1. **DO NOT Expose or Commit Secrets:**
   - Never commit `.env`, `.env.local`, or `.env.*` files.
   - Never log, hardcode, or echo secret tokens, API keys (`GOOGLE_API_KEY`, `TAVILY_API_KEY`, `JWT_SECRET_KEY`, `RAZORPAY_KEY_SECRET`), or DB connection credentials.
2. **DO NOT Delete or Manually Modify Lockfiles:**
   - Never manually edit or delete `package-lock.json` or `uv.lock`.
   - Always run the official package manager commands (`npm install`, `uv sync`) to update dependencies.
3. **DO NOT Introduce Untyped Code (`any` / Loose Typing):**
   - In TypeScript, avoid `@typescript-eslint/no-explicit-any`. Define strict types/interfaces in `client/src/types/`.
   - In Python, always use Pydantic models for request validation and response serialization.
4. **DO NOT Bypass Role or OAuth Guards:**
   - Never circumvent `require_teacher_group` or authentication dependencies on protected FastAPI endpoints.
   - Never alter PKCE challenge verification (`code_challenge` / `code_verifier`) without maintaining RFC 7636 compliance.
5. **DO NOT Cross-Contaminate Workspaces:**
   - Do not run frontend commands in `/server` or Python commands in `/client`. Keep dependencies strictly isolated to their folders.
