# ClassBuddy 🎓

<div align="center">

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.14-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Pub%2FSub-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Inngest](https://img.shields.io/badge/Inngest-Background_Jobs-FF5722?style=for-the-badge&logo=inngest&logoColor=white)](https://www.inngest.com/)
[![LangChain](https://img.shields.io/badge/LangGraph-Multi--Agent-1C3C3A?style=for-the-badge&logo=langchain&logoColor=white)](https://www.langchain.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**An intelligent full-stack educational ecosystem bridging teachers and students through autonomous multi-agent AI workflows, real-time collaboration, built-in monetization, and a custom standalone OAuth 2.0 PKCE authentication server.**

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Companion Mobile App](#-companion-mobile-app)
- [Visual Showcase](#-visual-showcase)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Workflows & Sequence Diagrams](#-workflows--sequence-diagrams)
- [Usage Guide & User Journeys](#-usage-guide--user-journeys)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Installation & Setup](#-installation--setup)
  - [Prerequisites](#prerequisites)
  - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-recommended)
  - [Option B: Local Development Setup](#option-b-local-development-setup)
- [Environment Variables](#-environment-variables)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Troubleshooting & FAQ](#-troubleshooting--faq)
- [Contributing](#-contributing)

---

## 🌟 Overview

**ClassBuddy** is an enterprise-grade, full-stack educational and classroom management platform designed for modern educators and learners. Rather than relying on generic third-party authentication and isolated chatbot wrappers, ClassBuddy provides a tightly integrated ecosystem featuring:

1. **Standalone Custom OAuth 2.0 PKCE Server**: Zero external identity vendor lock-in. Issues authorization codes, manages token families with reuse detection, and seamlessly supports web (`HttpOnly` cookies) and mobile clients (`Bearer` tokens).
2. **Modular Multi-Agent AI Engines (LangGraph + LangChain)**: Autonomous multi-node graph pipelines that self-evaluate and iteratively refine study notes, industry trends, and mock interview questions with live web search grounding (Tavily).
3. **High-Performance AI Streaming**: Token-by-token progressive rendering over Server-Sent Events (SSE) with custom React hooks.
4. **Horizontally Scalable Messaging Hub**: Low-latency group chats powered by FastAPI WebSockets and backed by a Redis Pub/Sub cluster backplane.
5. **Classroom Governance & Onboarding**: Strict role enforcement (`require_teacher_group`) ensuring structured group hierarchies, student rosters, and resource integrity.
6. **Monetization & Tiered Subscriptions**: Direct educator monetization with Razorpay payment workflows, custom tier configuration, and interactive financial analytics.

---

## 📱 Companion Mobile App

ClassBuddy includes an official, native Android application built to consume the standalone OAuth 2.0 PKCE authentication server and WebSocket messaging channels:

👉 **[ClassBuddy Android App Repository](https://github.com/Sandeep-singh-99/ClassBuddy_App)**

The mobile app integrates directly with the authorization server via deep linking (`classbuddy://oauth/callback`) and standard Bearer token authorization headers.

---

## 📸 Visual Showcase

<div align="center">

### Educator & Student Interactive Hub
![ClassBuddy Dashboard Showcase](./screenshot/Screenshot%202026-04-04%20231251.png)
*Unified classroom dashboard with analytics, notes studio, assignment distribution, and group management.*

<br/>

### Real-Time Classroom Chat & Collaborative Study
![ClassBuddy Real-Time Chat](./screenshot/Screenshot%202026-04-04%20231313.png)
*High-throughput group channels backed by WebSockets, Redis Pub/Sub, and persistent PostgreSQL storage.*

</div>

---

## ✨ Key Features

### 🔐 1. Custom OAuth 2.0 Authorization Server (PKCE)
- **Zero Third-Party Auth Dependencies**: Fully self-contained OIDC-style authorization server.
- **RFC 7636 PKCE Compliant**: Enforces `code_challenge` (`S256`) and `code_verifier` validation to safeguard public clients against interception.
- **Dual-Client Security Architecture**:
  - **Web Client (`classbuddy-web`)**: Employs encrypted `HttpOnly`, `SameSite=Lax`, `Secure` cookies (`access_token`, `refresh_token`) to mitigate XSS vulnerabilities.
  - **Android Client (`classbuddy-android`)**: Employs standard `Authorization: Bearer <access_token>` headers and JSON payload exchanges.
- **Token Family Rotation & Reuse Detection**: Rotates refresh tokens on each exchange; if a previously consumed token is presented, the entire token family is revoked immediately.
- **Dedicated OIDC Endpoints**:
  - `POST /api/v1/oauth/authorize/login` — Authenticates credentials & delivers single-use PKCE codes.
  - `POST /api/v1/oauth/token` — Exchanges authorization codes or refresh tokens for active sessions.
  - `POST /api/v1/oauth/revoke` — Explicitly invalidates active sessions and clears cookie state.
  - `GET /api/v1/oauth/userinfo` — Delivers cryptographically verified user claims and roles.

### 🏫 2. Teacher Group Onboarding & Governance
- **Strict Role-Based Access Control**: Teachers must create an active classroom group (`TeacherInsight`) before accessing protected studio resources.
- **Backend Security Guard (`require_teacher_group`)**: Enforced at the dependency injection level. Unauthorized attempts return HTTP 403:
  ```json
  {
    "detail": "Teacher must create a group before accessing this feature.",
    "code": "TEACHER_GROUP_REQUIRED"
  }
  ```
- **Single-Group Rule**: Guarantees a dedicated 1-to-1 operational classroom domain per teacher account.
- **Group Status Polling**: `GET /api/v1/teacher/group-status` dynamically drives the frontend onboarding guide vs. standard dashboard components.

### 🤖 3. Modular Multi-Agent AI System (LangGraph)
ClassBuddy leverages autonomous multi-agent state charts with self-correcting loops:
- **Notes Generation Agent (`notes_agent`)**:
  - `Planner Node` ➔ `Research Node (Tavily Search)` ➔ `Generator Node` ➔ `Evaluator Node` ➔ `Improver Node` ➔ `Saver Node`.
  - Continuously grades output structure, pedagogical clarity, and markdown formatting prior to persistence.
- **Industry & Career Insights Agent (`industry_agent`)**:
  - Scans live market trends, extracts skill requirements, performs competency gap analysis, and constructs actionable career roadmaps.
- **Mock Interview Preparation Agent (`interview_agent`)**:
  - Dynamically synthesizes targeted interview questions, multiple-choice quizzes, scoring rubrics, and automated evaluations.
- **Automated Assignment Evaluator (`ai_evaluator.py`)**:
  - Evaluates student assignment submissions against customizable teacher rubrics with qualitative feedback and detailed marks breakdown.

### ⚡ 4. Low-Latency Real-Time AI Streaming
- **Server-Sent Events (SSE)** at `/api/v1/ai/ai-stream`.
- Front-end integration via the custom reactive `useAIStream` hook for real-time progressive token streaming without UI blocking.

### 💬 5. Horizontally Scalable Real-Time Messaging Hub
- **Low-Latency Chat**: Integrated group communication using asynchronous FastAPI WebSockets.
- **Redis Pub/Sub Sync**: Enables multi-node backend clustering where messages broadcast seamlessly across instances.
- **Persistent Message Ledger**: Messages are asynchronously stored in PostgreSQL and retrieved on-demand via cursor-based viewport scrolling.

### 💳 6. Tiered Subscriptions & Monetization
- **Flexible Pricing Tiers**: Teachers can configure up to 3 subscription levels (Free, Basic, Premium).
- **Razorpay Checkout Integration**: End-to-end payment order creation, webhook verification, and automated entitlement activation.
- **Revenue Analytics**: Interactive Recharts dashboards for tracking MRR, active subscribers, and transaction logs.

### 📂 7. Document & Media Management
- Direct PDF and study material uploads backed by Cloudinary CDN.
- Role-gated document access for enrolled classroom members.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client_Tier [Client Applications]
        Web[React 18 / Vite 7 SPA]
        Mobile[Android Native App]
    end

    subgraph Auth_Tier [Standalone OAuth2 PKCE Server]
        OAuthRoute["/api/v1/oauth Endpoints"]
        PKCEVerifier[PKCE S256 Verifier]
        CookieHandler[HttpOnly Cookie Manager]
        TokenRevoker[Token Family Reuse Detector]
    end

    subgraph Gateway_Tier [FastAPI Core Gateway]
        API[FastAPI Application]
        Limiter[SlowAPI Rate Limiter]
        Guard[require_teacher_group Guard]
        WSManager[WebSocket Connection Pool]
        SSEEndpoint[SSE Streaming Engine]
    end

    subgraph Broker_Tier [Real-Time Brokerage]
        RedisPubSub[(Redis Pub/Sub)]
        RedisCache[(Redis Cache)]
    end

    subgraph Data_Tier [Persistence Layer]
        Postgres[(PostgreSQL - NeonDB)]
        Alembic[Alembic Migrations]
    end

    subgraph AI_Tier [LangGraph Multi-Agent Workflows]
        NotesAgent[Notes Agent Workflow]
        IndustryAgent[Career Insights Agent]
        InterviewAgent[Mock Interview Agent]
        EvaluatorNode[Self-Evaluation & Quality Loop]
        LLM[Gemini 2.5 Flash / Groq / HuggingFace]
        TavilyAPI[Tavily Search API]
    end

    subgraph Async_Tier [Durable Execution]
        InngestQueue[Inngest Event Orchestrator]
    end

    subgraph Cloud_Tier [Third-Party Services]
        Razorpay[Razorpay Payments]
        Cloudinary[Cloudinary Media CDN]
    end

    %% Client Interactions
    Web <-->|HttpOnly Cookies / REST| API
    Web <-->|SSE Stream Token Feed| SSEEndpoint
    Mobile <-->|Bearer Token / REST| API
    Web <-->|OAuth2 PKCE Flow| OAuthRoute
    Mobile <-->|OAuth2 PKCE Flow| OAuthRoute

    %% Auth Processing
    OAuthRoute --> PKCEVerifier
    OAuthRoute --> CookieHandler
    OAuthRoute --> TokenRevoker

    %% Core Processing & Guards
    API --> Limiter
    API --> Guard
    Guard <-->|Verify Group Association| Postgres
    API <--> Postgres
    API <--> RedisCache

    %% WebSockets
    API <--> WSManager
    WSManager <--> RedisPubSub

    %% Async & Background
    API -->|Dispatch Events| InngestQueue
    InngestQueue -->|Background Async Jobs| Postgres
    InngestQueue <--> AI_Tier

    %% AI Workflows
    SSEEndpoint <--> AI_Tier
    AI_Tier --> NotesAgent & IndustryAgent & InterviewAgent
    NotesAgent & IndustryAgent & InterviewAgent <--> EvaluatorNode
    EvaluatorNode <--> LLM
    NotesAgent <--> TavilyAPI

    %% External Services
    API <--> Razorpay
    API <--> Cloudinary
```

---

## 🔄 Workflows & Sequence Diagrams

### 1. Standalone OAuth 2.0 PKCE Flow (Dual Client)

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Student / Teacher
    participant App as Web / Android App
    participant OAuth as OAuth2 Authorization Server
    participant DB as PostgreSQL DB

    User->>App: Input Credentials (Email & Password)
    App->>App: Generate PKCE code_verifier & S256 code_challenge
    App->>OAuth: POST /api/v1/oauth/authorize/login (Credentials + Challenge)
    OAuth->>DB: Validate user & record authorization_code + challenge
    OAuth-->>App: Return authorization_code

    App->>OAuth: POST /api/v1/oauth/token (code + code_verifier)
    OAuth->>OAuth: Verify S256(code_verifier) == code_challenge

    alt Web Client (classbuddy-web)
        OAuth-->>App: Set-Cookie: access_token & refresh_token (HttpOnly, Secure, SameSite)
    else Android Client (classbuddy-android)
        OAuth-->>App: JSON { access_token, refresh_token, token_type: "Bearer" }
    end

    App->>OAuth: GET /api/v1/oauth/userinfo
    OAuth-->>App: Return User Profile & Role Claims
```

---

### 2. Teacher Group Onboarding & Access Guard

```mermaid
sequenceDiagram
    autonumber
    actor Teacher
    participant UI as React Client
    participant API as FastAPI Backend
    participant Guard as require_teacher_group Dependency
    participant DB as PostgreSQL DB

    Teacher->>UI: Navigate to Teacher Studio (/t-dashboard/home)
    UI->>API: GET /api/v1/teacher/group-status
    API->>DB: Query TeacherInsight by user_id
    DB-->>API: No group record found (group_count: 0)
    API-->>UI: { "has_group": false, "group_count": 0 }
    UI->>Teacher: Render "Create Your First Group" Onboarding Wizard

    opt Teacher Attempts Direct Protected Action (e.g., Create Notes)
        UI->>API: POST /api/v1/notes/
        API->>Guard: Evaluate require_teacher_group
        Guard->>DB: Query Group Existence
        DB-->>Guard: Null
        Guard-->>UI: HTTP 403 Forbidden { "code": "TEACHER_GROUP_REQUIRED" }
        UI->>Teacher: Trigger Toast Alert & Redirect to Group Creation
    end

    Teacher->>UI: Complete Group Creation Form (/t-insight)
    UI->>API: POST /api/v1/insights/ (name, description, thumbnail)
    API->>DB: Save TeacherInsight
    DB-->>API: Persisted (group_id: 101)
    API-->>UI: HTTP 201 Created
    UI->>UI: Redux setHasGroup(true)
    UI->>Teacher: Unlock Full Educator Studio Dashboard
```

---

### 3. Multi-Agent AI Iterative Generation & Streaming

```mermaid
sequenceDiagram
    autonumber
    actor User as Educator / Student
    participant UI as React Frontend (useAIStream)
    participant API as FastAPI Backend (/ai-stream)
    participant Graph as LangGraph Orchestrator
    participant Tavily as Tavily Web Search
    participant LLM as Gemini 2.5 Flash
    participant DB as PostgreSQL & Redis

    User->>UI: Trigger Note / Study Guide Generation
    UI->>API: Connect SSE /api/v1/ai/ai-stream?topic={topic}
    API->>Graph: Invoke Multi-Agent State Machine

    Graph->>Graph: Node: Planner (Outline Construction)
    Graph->>Tavily: Node: Research (Live Web Query)
    Tavily-->>Graph: Return authoritative source snippets

    Graph->>LLM: Node: Generator (Draft Generation)
    LLM-->>Graph: Return Initial Draft

    Graph->>LLM: Node: Evaluator (Quality Assessment & Validation)
    alt Quality Criteria Below Threshold (< 8.0/10)
        Graph->>LLM: Node: Improver (Targeted Revisions with Rubric)
        LLM-->>Graph: Return Polished Output
    else Quality Criteria Met (>= 8.0/10)
        Graph->>Graph: Node: Finalizer
    end

    Graph-->>API: Progressive Output Chunks
    API-->>UI: Server-Sent Events (data: token)
    UI->>User: Progressive Live Markdown Rendering

    API->>DB: Persist Completed Document & Invalidate Stale Cache
```

---

### 4. Scalable WebSocket Messaging with Redis Pub/Sub

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Student A
    participant WSC1 as Alice Client
    participant Node1 as Backend Instance 1
    participant Redis as Redis Pub/Sub Channel
    participant Node2 as Backend Instance 2
    participant WSC2 as Teacher Client
    actor Bob as Teacher Bob

    Alice->>WSC1: Submit Chat Message ("How do I approach Question 3?")
    WSC1->>Node1: WebSocket Message Payload
    Node1->>Node1: Persist message asynchronously to PostgreSQL
    Node1->>Redis: PUBLISH group_messages_{group_id} payload
    Redis-->>Node1: Broadcast message
    Redis-->>Node2: Broadcast message
    Node2->>WSC2: Send WebSocket Frame to active session
    WSC2->>Bob: Instantly render message in chat feed
```

---

## 🎯 Usage Guide & User Journeys

### 👩‍🏫 The Educator / Teacher Journey

1. **Sign Up & Authentication**:
   - Register a new account selecting the **Teacher** role.
   - Login generates an authorization code via PKCE and initializes a secure session.
2. **Classroom Group Onboarding**:
   - First-time entry redirects to the onboarding wizard (`/t-insight`).
   - Define group title, subject specialization, bio, and upload a thumbnail.
   - Once saved, all educator capabilities unlock instantly.
3. **Configure Subscription Monetization**:
   - Navigate to **Subscriptions** tab.
   - Configure up to 3 subscription tiers with pricing and benefits.
4. **Author Study Guides with AI**:
   - Enter **Notes Studio**.
   - Input a curriculum topic or upload reference documents.
   - Trigger the **LangGraph Notes Agent** to synthesize, self-evaluate, and export structured markdown notes.
5. **Assign Tasks & Review Submissions**:
   - Create custom assignments with deadlines or generate questions using AI.
   - Review student submissions with automated grading suggestions powered by `ai_evaluator`.
6. **Classroom Engagement**:
   - Open the **Classroom Chat** channel to interact in real-time with enrolled students.

---

### 👨‍🎓 The Student Journey

1. **Sign Up & Account Creation**:
   - Register as a **Student**.
2. **Explore Teacher Directory**:
   - Navigate to **Explore Teachers** (`/dashboard/teachers`).
   - Browse educator profiles, group syllabi, and subscription tiers.
3. **Enroll via Razorpay**:
   - Select a subscription plan and complete checkout securely.
4. **Access Study Materials & AI Stream**:
   - Read curated study notes and stream interactive explanations using the token-by-token AI streamer.
   - Download course documents and reference PDFs.
5. **Submit Assignments & Receive Feedback**:
   - View pending tasks, upload solutions, and receive comprehensive rubric assessments.
6. **Prepare for Careers & Interviews**:
   - Launch the **Industry Insights** module to see current market trends and skill matrices.
   - Practice with the **Mock Interview Agent** to answer dynamically generated technical and conceptual quizzes.

---

## 📡 API Endpoints Reference

All application endpoints are served under `/api/v1`. Below is an overview of core API groups:

### 🔐 OAuth 2.0 & Authentication (`/oauth`, `/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/oauth/authorize/login` | Authenticates credentials and returns a PKCE authorization code |
| `POST` | `/api/v1/oauth/token` | Exchanges authorization code or refresh token for sessions |
| `POST` | `/api/v1/oauth/revoke` | Revokes refresh tokens and invalidates session cookies |
| `GET` | `/api/v1/oauth/userinfo` | Delivers authenticated user claims and profile details |
| `POST` | `/api/v1/auth/register` | Creates a new teacher or student account |

### 🏫 Teacher & Group Management (`/teacher`, `/insights`, `/groups`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/teacher/group-status` | Returns group status (`has_group: bool`, count) |
| `POST` | `/api/v1/insights/` | Creates the teacher's classroom group |
| `GET` | `/api/v1/insights/` | Retrieves current teacher group profile and metrics |
| `GET` | `/api/v1/groups/all` | Lists all active teacher groups for student discovery |

### 🤖 AI Workflows & Streaming (`/ai`, `/notes`, `/student-insight`, `/interview-prep`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/ai/ai-stream` | Real-time Server-Sent Events (SSE) AI token streaming |
| `POST` | `/api/v1/notes/generate` | Triggers LangGraph multi-agent note synthesis workflow |
| `POST` | `/api/v1/ai-evaluator/evaluate` | Evaluates assignment submissions against rubrics |
| `POST` | `/api/v1/student-insight/generate` | Generates personalized industry career matrix |
| `POST` | `/api/v1/interview-prep/generate` | Synthesizes interactive mock interview quiz questions |

### 💬 Messaging & WebSockets (`/group-messages`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `WEBSOCKET` | `/api/v1/group-messages/ws/{group_id}` | Bidirectional WebSocket stream for group chat |
| `GET` | `/api/v1/group-messages/{group_id}` | Fetches paginated historical group messages |

### 💳 Subscriptions & Payments (`/subscription`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/subscription/create-tier` | Configures a new tier for a teacher group |
| `POST` | `/api/v1/subscription/create-order` | Initiates a Razorpay payment order |
| `POST` | `/api/v1/subscription/verify` | Validates Razorpay payment signature & activates subscription |
| `GET` | `/api/v1/subscription/teacher-stats` | Returns earnings, MRR, and subscriber metrics |

### 🩺 System Health (`/health`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service liveness and database connection status probe |

> 💡 **Interactive API Documentation**: Run the server and navigate to [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI) or [http://localhost:8000/redoc](http://localhost:8000/redoc) (ReDoc).

---

## 🛠️ Tech Stack

### **Frontend (Client)**
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `18.3.1` | Declarative component UI library |
| **Vite** | `7.1.2` | High-speed frontend build tooling & HMR |
| **TypeScript** | `5.8.3` | Static typing and interfaces |
| **Tailwind CSS** | `4.1.12` | Modern utility-first responsive styling |
| **Redux Toolkit & Persist** | `^2.8.2` / `^6.0.0` | Global state management with storage persistence |
| **React Router** | `^7.8.1` | Declarative client-side routing & guard protection |
| **Radix UI Primitives** | Latest | Accessible unstyled headless UI components |
| **Recharts** | `^2.15.4` | Composable charting library for analytics |
| **React MD Editor** | `^4.0.8` | Markdown authoring and live preview |
| **Lucide React** | `^0.540.0` | Clean, modern iconography |
| **Sonner** | `^2.0.7` | Opinionated toast notifications |
| **Axios** | `^1.11.0` | Promise-based HTTP client for API requests |

### **Backend (Server)**
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **FastAPI** | `0.136+` | High-performance asynchronous Python REST API framework |
| **Python** | `3.10+ / 3.14` | Core backend programming language |
| **SQLAlchemy** | `2.0+` | Type-safe Object Relational Mapper (ORM) |
| **Alembic** | `1.19+` | Database schema migrations management |
| **PostgreSQL (NeonDB)** | Latest | Serverless cloud relational database |
| **Redis** | `8.0+` | High-throughput Pub/Sub message broker & caching layer |
| **SlowAPI** | `0.1.9` | IP-based request rate limiting middleware |
| **PyJWT & Python-Jose** | Latest | JWT signing, verification, and PKCE validation |
| **Uvicorn** | `0.49+` | Asynchronous ASGI production server |

### **AI & Background Processing**
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **LangGraph & LangChain** | `1.3.6+` | Stateful multi-agent graph architecture & orchestration |
| **Google Gemini 2.5 Flash** | Latest | Core LLM for reasoning, synthesis, and grading |
| **Tavily Search API** | Latest | Real-time web ground truth search engine |
| **Inngest** | `0.5.18+` | Durable serverless background event queue and cron scheduler |

### **Infrastructure & DevOps**
| Technology | Purpose |
| :--- | :--- |
| **Docker & Docker Compose** | Multi-container development and production orchestration |
| **Nginx** | Reverse proxy and production static asset web server |
| **Cloudinary** | Cloud object storage and CDN for documents and avatars |
| **Razorpay** | Payment processing gateway for subscriptions |
| **GitHub Actions** | Automated CI/CD pipeline for Docker builds and deployment |

---

## 📂 Project Directory Structure

```text
ClassBuddy/
├── .github/
│   └── workflows/
│       └── backend-ci.yml           # Automated CI/CD pipeline for backend builds & deployment
│
├── client/                          # React 18 + TypeScript + Vite Frontend Application
│   ├── public/                      # Static assets & routing manifests (_redirects, favicon)
│   ├── src/
│   │   ├── assets/                  # Local styling assets & imagery
│   │   ├── components/              # Reusable UI primitives, Modals, Protected Route wrappers
│   │   ├── helper/                  # Axios HTTP client, PKCE helpers, SSE stream reader
│   │   ├── hooks/                   # Custom React hooks (useAIStream, auth hooks)
│   │   ├── lib/                     # Styling utility helpers (clsx, tw-merge)
│   │   ├── page/                    # Application route views & screens
│   │   │   ├── ChatDashboard/       # Real-time WebSocket classroom chat interface
│   │   │   ├── Dashboard/           # Student portals (Notes, Docs, Assignments, Career, Quiz)
│   │   │   ├── Teacher/             # Educator portals (THome, TInsight, TNotes, TAssignment)
│   │   │   ├── Home.tsx             # Public landing page
│   │   │   └── OAuthCallback.tsx    # PKCE authorization code exchange receiver
│   │   ├── redux/                   # Redux Toolkit slices (authSlice, tSlice, noteSlice)
│   │   ├── routes/                  # React Router configuration & role guard definitions
│   │   ├── services/                # API communication layers
│   │   ├── types/                   # TypeScript interfaces, schemas & DTOs
│   │   ├── App.tsx                  # Root application shell
│   │   ├── main.tsx                 # Entrypoint bootstrap
│   │   └── index.css                # Tailwind CSS 4 design token imports
│   ├── Dockerfile.dev               # Client development container specification
│   ├── Dockerfile.prod              # Client multi-stage production container (Nginx)
│   ├── nginx.conf                   # Production Nginx reverse proxy configuration
│   ├── package.json                 # Frontend dependencies and npm scripts
│   ├── tsconfig.json                # TypeScript compiler configuration
│   └── vite.config.ts               # Vite build configuration
│
├── server/                          # FastAPI Asynchronous Python Backend
│   ├── alembic/                     # Database migration definitions
│   │   ├── versions/                # Incremental schema migration scripts
│   │   └── env.py                   # Alembic execution environment
│   ├── app/
│   │   ├── ai/                      # Modular LangGraph Multi-Agent Workflows
│   │   │   ├── industry_agent/      # Career landscape & market trend analyzer
│   │   │   ├── interview_agent/     # Dynamic mock interview & quiz engine
│   │   │   └── notes_agent/         # Automated study guide & notes studio
│   │   ├── api/v1/
│   │   │   ├── endpoints/           # Modular FastAPI route controllers
│   │   │   │   ├── ai_evaluator.py  # AI assignment grading endpoint
│   │   │   │   ├── ai_stream.py     # Server-Sent Events (SSE) AI token stream
│   │   │   │   ├── assignment.py    # Assignment distribution & submission
│   │   │   │   ├── auth.py          # Legacy authentication endpoints
│   │   │   │   ├── docsupload.py    # Cloudinary resource distribution
│   │   │   │   ├── group.py         # Group exploration & management
│   │   │   │   ├── groupMessage.py  # WebSocket chat persistence & history
│   │   │   │   ├── health.py        # Service liveness & readiness probes
│   │   │   │   ├── oauth.py         # Standalone OAuth 2.0 PKCE endpoints
│   │   │   │   ├── teacher.py       # Group status checker endpoint
│   │   │   │   ├── teacherInsight.py# Group onboarding & profile endpoints
│   │   │   │   └── subscription.py  # Razorpay integration & tier controllers
│   │   │   └── api.py               # Combined API v1 route aggregator
│   │   ├── config/                  # Configuration loaders, settings, DB engine
│   │   ├── core/                    # Rate limiter configuration and logger
│   │   ├── dependencies/            # Dependency injection (OAuth auth & group guards)
│   │   ├── inngest/                 # Inngest asynchronous background functions
│   │   ├── models/                  # SQLAlchemy ORM declarative models
│   │   ├── schemas/                 # Pydantic validation request/response schemas
│   │   ├── services/                # Business logic services (OAuthService, SocketManager)
│   │   ├── utils/                   # Helpers, hashing, token generators
│   │   └── main.py                  # FastAPI lifespan & exception handlers
│   ├── alembic.ini                  # Alembic CLI configuration file
│   ├── Dockerfile.dev               # Backend development container specification
│   ├── Dockerfile.prod              # Backend production container specification
│   ├── pyproject.toml               # Python project specifications and dependencies
│   ├── requirements.txt             # Pinned pip requirements file
│   └── uv.lock                      # uv lockfile for deterministic dependency resolution
│
├── screenshot/                      # High-resolution application screenshots
├── docker-compose.dev.yml           # Multi-container local development stack
├── docker-compose.prod.yml          # Multi-container production deployment stack
└── README.md                        # Master project documentation
```

---

## 🚀 Installation & Setup

### Prerequisites

Ensure the following tools are installed on your workstation:
- **Node.js**: `v18.0.0` or higher (v20+ recommended)
- **Python**: `v3.10` or higher (`v3.14` supported)
- **Package Managers**: `npm` (frontend) and [`uv`](https://docs.astral.sh/uv/) or `pip` (backend)
- **Docker & Docker Compose**: (Optional, recommended for quick environment spin-up)
- **PostgreSQL Database**: Accessible PostgreSQL instance (e.g. NeonDB, Supabase, or local)
- **Redis Server**: Local Redis instance or cloud provider (e.g. Upstash, Redis Cloud)

---

### Option A: Docker Compose (Recommended)

The easiest way to bootstrap the complete application stack:

#### 1. Development Mode (with Live Reload)
```bash
# Clone the repository
git clone https://github.com/Sandeep-singh-99/ClassBuddy.git
cd ClassBuddy

# Create environment configuration files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Spin up all development containers
docker compose -f docker-compose.dev.yml up --build
```
- **Web Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

#### 2. Production Mode (Optimized Nginx + Production Uvicorn)
```bash
docker compose -f docker-compose.prod.yml up --build -d
```
- **Web Client (Nginx)**: [http://localhost](http://localhost) (Port 80)
- **Backend API**: [http://localhost:8000](http://localhost:8000)

---

### Option B: Local Development Setup

If you prefer running services directly on your host machine:

#### Step 1: Clone the Repository
```bash
git clone https://github.com/Sandeep-singh-99/ClassBuddy.git
cd ClassBuddy
```

#### Step 2: Configure Environment Variables
Create the required environment files for both server and client:
```bash
# Server configuration
touch server/.env

# Client configuration
touch client/.env
```
*(Populate both files following the [Environment Variables](#-environment-variables) section).*

#### Step 3: Set Up and Run the Backend

```bash
cd server

# Using uv (High-speed Python package manager - Recommended)
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000

# OR using standard Python virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

The API server will initialize on `http://127.0.0.1:8000`.

#### Step 4: Set Up and Run the Frontend

In a separate terminal window:
```bash
cd client

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The React web client will be accessible at `http://localhost:5173`.

#### Step 5: Start Background Job Dev Server (Inngest)

To simulate asynchronous agent executions locally:
```bash
npx inngest-cli@latest dev -u http://127.0.0.1:8000/api/inngest
```
Access the Inngest local dashboard at `http://localhost:8288`.

---

## ⚙️ Environment Variables

### Backend Configuration (`server/.env`)

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | String | *Required* | PostgreSQL connection string (NeonDB or local) |
| `JWT_SECRET_KEY` | String | *Required* | Secret key used for signing HS256 tokens |
| `JWT_ALGORITHM` | String | `HS256` | Signing algorithm (`HS256` or `RS256`) |
| `OAUTH_ISSUER` | String | `classbuddy` | Token issuer identifier |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Integer | `15` | Access token lifespan in minutes |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Integer | `30` | Refresh token lifespan in days |
| `OAUTH_WEB_CLIENT_ID` | String | `classbuddy-web` | Client ID for React web application |
| `OAUTH_WEB_REDIRECT_URI` | String | `http://localhost:5173/oauth/callback` | Authorized redirect URI for web client |
| `OAUTH_ANDROID_CLIENT_ID`| String | `classbuddy-android` | Client ID for Android mobile application |
| `OAUTH_ANDROID_REDIRECT_URI`| String | `classbuddy://oauth/callback` | Deep-link redirect URI for mobile client |
| `OAUTH_ALLOWED_SCOPES` | String | `openid,profile,email` | Comma-delimited list of supported scopes |
| `COOKIE_SECURE` | Boolean | `false` | Set to `true` in production with HTTPS |
| `COOKIE_SAMESITE` | String | `lax` | Cookie SameSite policy (`lax`, `strict`, `none`) |
| `COOKIE_DOMAIN` | String | *None* | Optional cookie domain restriction |
| `COOKIE_PATH` | String | `/` | Cookie URL path |
| `CORS_ORIGINS` | String | `http://localhost:5173` | Comma-separated allowed frontend origins |
| `REDIS_HOST` | String | `localhost` | Redis server hostname |
| `REDIS_PORT` | Integer | `6379` | Redis server port |
| `REDIS_USER` | String | *None* | Redis username (if authentication enabled) |
| `REDIS_PASSWORD` | String | *None* | Redis password |
| `GOOGLE_API_KEY` | String | *Required* | Google Gemini API Key for LangChain/LangGraph |
| `TAVILY_API_KEY` | String | *Required* | Tavily Search API Key for agent live web context |
| `CLOUDINARY_CLOUD_NAME` | String | *Required* | Cloudinary cloud account name |
| `CLOUDINARY_API_KEY` | String | *Required* | Cloudinary API public key |
| `CLOUDINARY_API_SECRET` | String | *Required* | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | String | *Required* | Razorpay public key ID |
| `RAZORPAY_KEY_SECRET` | String | *Required* | Razorpay private secret |
| `INNGEST_DEV` | String | `1` | Set to `1` during local development |
| `INNGEST_SIGNING_KEY` | String | *None* | Production Inngest webhook signature key |

#### Backend Example Template (`server/.env.example`)
```env
# Database
DATABASE_URL=postgresql://neondb_owner:password@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require

# JWT & OAuth Server Settings
JWT_SECRET_KEY=replace-with-a-64-character-random-hex-secret
JWT_ALGORITHM=HS256
OAUTH_ISSUER=classbuddy
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30

# OAuth Public Clients
OAUTH_WEB_CLIENT_ID=classbuddy-web
OAUTH_WEB_REDIRECT_URI=http://localhost:5173/oauth/callback
OAUTH_ANDROID_CLIENT_ID=classbuddy-android
OAUTH_ANDROID_REDIRECT_URI=classbuddy://oauth/callback
OAUTH_ALLOWED_SCOPES=openid,profile,email

# Cookie Settings (Web Application)
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
COOKIE_DOMAIN=localhost
COOKIE_PATH=/

# CORS
CORS_ORIGINS=http://localhost:5173

# Redis Brokerage
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USER=default
REDIS_PASSWORD=

# AI & Multi-Agent Framework
GOOGLE_API_KEY=AIzaSyYourGeminiApiKeyHere
TAVILY_API_KEY=tvly-YourTavilyApiKeyHere

# Media CDN (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_test_YourKeyId
RAZORPAY_KEY_SECRET=YourRazorpaySecret

# Inngest Background Queue
INNGEST_DEV=1
```

---

### Frontend Configuration (`client/.env`)

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | String | `http://localhost:8000/api/v1` | Base URL targeting the FastAPI backend |
| `VITE_OAUTH_CLIENT_ID` | String | `classbuddy-web` | Public client ID registered on OAuth server |
| `VITE_OAUTH_REDIRECT_URI` | String | `http://localhost:5173/oauth/callback` | Client redirect endpoint for PKCE callback |

#### Frontend Example Template (`client/.env.example`)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_OAUTH_CLIENT_ID=classbuddy-web
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback
```

---

## 🧪 Testing & Quality Assurance

### Backend Automated Tests
ClassBuddy uses `pytest` and `pytest-asyncio` for unit and integration testing:

```bash
cd server

# Execute full pytest suite with verbose output
uv run pytest -v

# Run with test coverage report
uv run pytest --cov=app tests/
```

### Frontend Code Quality
Validate TypeScript types and code linting:

```bash
cd client

# Check TypeScript compilability
npm run build

# Run ESLint validation
npm run lint
```

### Continuous Integration (CI/CD)
Every push and pull request to `main` and `develop` triggers the GitHub Actions workflow (`.github/workflows/backend-ci.yml`), which:
1. Checks out repository source code.
2. Builds the multi-stage production Docker image.
3. Pushes tagged container images to Docker Hub.
4. Triggers automatic deploy hooks on Render for zero-downtime releases.

---

## ❓ Troubleshooting & FAQ

<details>
<summary><b>1. Why am I getting HTTP 403 <code>TEACHER_GROUP_REQUIRED</code>?</b></summary>
<br>
Teachers must create a classroom group before accessing protected endpoints (such as note authoring, assignment management, or document sharing). Navigate to <code>/t-insight</code> or click the onboarding banner on the teacher dashboard to complete group creation.
</details>

<details>
<summary><b>2. Why are authentication cookies not being set on the web client?</b></summary>
<br>
If you are developing locally on <code>http://localhost</code>, ensure that <code>COOKIE_SECURE=false</code> in <code>server/.env</code>. When <code>COOKIE_SECURE=true</code>, browsers strictly refuse to store cookies over plain HTTP. In production over HTTPS, always set <code>COOKIE_SECURE=true</code>.
</details>

<details>
<summary><b>3. Why is Redis Pub/Sub failing to connect?</b></summary>
<br>
Verify that Redis is running locally on port <code>6379</code> or that your cloud Redis credentials in <code>server/.env</code> (host, port, user, password) are accurate. Test connection using:
<pre><code>redis-cli -h 127.0.0.1 -p 6379 ping</code></pre>
</details>

<details>
<summary><b>4. How do I apply new database migrations?</b></summary>
<br>
Run Alembic migrations from the <code>server/</code> folder:
<pre><code>cd server
uv run alembic upgrade head
</code></pre>
</details>

---

## 🤝 Contributing

We welcome contributions from the open-source community! Follow these steps to contribute:

1. **Fork the Repository**: Click the `Fork` button at the top-right of this repository.
2. **Clone your Fork**:
   ```bash
   git clone https://github.com/<your-username>/ClassBuddy.git
   cd ClassBuddy
   ```
3. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make Your Changes**: Write clean, maintainable, and well-documented code.
5. **Run Tests & Linter**: Ensure tests pass and no linting errors are introduced.
6. **Commit Your Work**:
   ```bash
   git commit -m "feat(agent): add structured markdown validation to notes_agent"
   ```
7. **Push to GitHub**:
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Submit a Pull Request**: Open a PR targeting the `develop` branch with a clear description of your changes.

---

<div align="center">
  <sub>Built with ❤️ by Sandeep Singh and contributors for the future of education.</sub>
</div>

