# GEMINI.md — Google Antigravity Agent Configuration

@[Project Rules](AGENTS.md)

---

## Google Antigravity Execution Directives

### 1. Terminal Sandbox & Environment Directives (Windows / PowerShell)
- **Host OS & Shell:** Windows execution environment using PowerShell. All commands are invoked in fresh subshells (working directory and environment variables do not persist across tool calls).
- **Subdirectory Operations:** Always navigate explicitly in single-line command blocks:
  - Frontend: `cd client; npm run <script>` (or `cd client && npm run <script>`)
  - Backend: `cd server; uv run <command>` (or `cd server && uv run <command>`)
- **Sandboxed Execution First:** Run commands in Standard Sandbox Mode (`BypassSandbox: false`) by default. Never switch to `BypassSandbox: true` unless network access or elevated host permissions are explicitly required.
- **Reactive Wakeups (No Polling):** Commands that continue running asynchronously will complete in the background and wake the agent reactively. Do NOT poll, sleep, or loop waiting for background tasks.
- **Local Server Lifecycle:** On Windows, background services started inside the sandbox are only reachable within the same command invocation. Do not attempt to poll or curl a sandboxed background daemon from a separate `run_command` turn.
- **Python Versioning with `uv`:** The host system default Python may be older, but the backend requires Python `>=3.14`. Always invoke Python, Alembic, and Pytest via `cd server; uv run ...` to ensure the project virtual environment (Python 3.14) is targeted.

### 2. Subagent Delegation Preferences
- **Research Subagent (`research`):** Delegate extensive exploratory tasks (e.g., surveying LangGraph agent mechanics, reviewing OAuth 2.0 PKCE specs across multiple endpoints, or tracing Redux actions through large component trees) to avoid cluttering the parent conversation context.
- **Self Subagent (`self`):** Delegate independent refactoring tracks or isolated scratch-pad tasks when running multi-step experiments.
- **Subagent Concurrency:** Subagent invocations run asynchronously with reactive wakeups; avoid polling or sleep loops when waiting for subagent completions.

### 3. Verification & Quality Gate Directives
- **Zero-Error TypeScript Gate:** After modifying client files, verify with `cd client; npx tsc -b`. If any type errors or missing imports occur, resolve them immediately.
- **Frontend Production Build Gate:** Run `cd client; npm run build` to ensure the Vite production bundle builds cleanly.
- **Backend Bytecode Gate:** After modifying backend files, verify with `cd server; uv run python -m compileall -q app` to catch syntax or import breakage immediately.
- **Database Model Migrations:** Any change to SQLAlchemy models in `server/app/models/` must be paired with an Alembic migration (`cd server; uv run alembic revision --autogenerate -m "<name>"`).
- **Preserve Lockfiles & Clean Diffs:** Ensure `package-lock.json` and `uv.lock` are never edited manually.
