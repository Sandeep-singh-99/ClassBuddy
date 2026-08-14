# ClassBuddy 🎓

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![OAuth2](https://img.shields.io/badge/OAuth2-Custom_Authorization_Server_PKCE-FF6F00?logo=oauth&logoColor=white&style=flat-square)](#-custom-oauth-20-authorization-server)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black&style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi&logoColor=white&style=flat-square)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-4169E1?logo=postgresql&logoColor=white&style=flat-square)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-PubSub-DC382D?logo=redis&logoColor=white&style=flat-square)](https://redis.io/)
[![Inngest](https://img.shields.io/badge/Inngest-Background_Jobs-FF5722?logo=inngest&logoColor=white&style=flat-square)](https://www.inngest.com/)
[![LangChain](https://img.shields.io/badge/LangChain-Agentic-1C3C3A?logo=langchain&logoColor=white&style=flat-square)](https://www.langchain.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white&style=flat-square)](https://www.docker.com/)

**ClassBuddy** is a next-generation, premium full-stack educational ecosystem that connects teachers and students through intelligent AI agents, real-time communication systems, interactive study dashboards, built-in subscription monetization, and a custom standalone OAuth 2.0 PKCE authentication server.

---

## 🌐 Mobile App Repository

Find the official Android mobile client repository here:

**🔗 [ClassBuddy Android App](https://github.com/Sandeep-singh-99/ClassBuddy_App)**

---

![ClassBuddy Mockup](./screenshot/Screenshot%202026-04-04%20231251.png)
![ClassBuddy Chat](./screenshot/Screenshot%202026-04-04%20231313.png)

---

## ✨ Core Highlights & Security

### 🔐 Custom OAuth 2.0 Authorization Server (PKCE)
ClassBuddy operates as its own **standalone OAuth 2.0 Authorization Server** with no external identity providers.
* **PKCE Architecture**: Uses Authorization Code Flow with PKCE (`S256` code challenge validation).
* **Dual Client Support**:
  * **Web Application (`classbuddy-web`)**: Uses `HttpOnly`, `SameSite`, `Secure` cookies (`access_token`, `refresh_token`) for silent credential transport.
  * **Android Mobile Client (`classbuddy-android`)**: Uses `Authorization: Bearer <access_token>` headers and JSON response tokens.
* **Security & Reuse Detection**: Automated refresh token rotation with immediate token family revocation if an expired or stolen refresh token is reused.
* **Standard OIDC Endpoints**:
  * `POST /api/v1/oauth/authorize/login`: Validates credentials & yields single-use PKCE authorization codes.
  * `POST /api/v1/oauth/token`: Exchanges code or refresh token for active sessions.
  * `POST /api/v1/oauth/revoke`: Revokes refresh tokens & clears HttpOnly cookies.
  * `GET /api/v1/oauth/userinfo`: Delivers user profile attributes.

### 🏫 Teacher Group Onboarding & Access Control
* **Onboarding Workflow**: Teachers must create a classroom group before accessing protected dashboard capabilities.
* **Backend Security Guard (`require_teacher_group`)**: Backend enforces group ownership (`TeacherInsight.user_id == current_user.id`). Restricted API calls without a group return HTTP 403:
  ```json
  {
    "detail": "Teacher must create a group before accessing this feature.",
    "code": "TEACHER_GROUP_REQUIRED"
  }
  ```
* **Group Status API**: `GET /api/v1/teacher/group-status` returns `{"has_group": bool, "group_count": int}` to dynamically toggle the frontend onboarding banner versus standard dashboard views.
* **Single Group Rule**: Strictly enforces a maximum of 1 group per teacher (`400 Bad Request` on duplicate creation attempts).

---

## ⚡ Additional Key Features

### 🤖 Multi-Agent AI System
* **Automated Notes Studio**: Autonomously researches topics using Tavily Search, gathers web resources, and outputs structured study materials complete with summaries and key takeaways via LangGraph.
* **Smart Assignment Architect**: Generates customized assignments based on topics, reading levels, and uploaded course files.
* **AI Evaluation Engine**: Evaluates student submissions, grading responses and providing personalized feedback.
* **Mock Interview Prep**: Interactive terminal simulator generating dynamic stream-matched technical interview questions.

### 💬 Real-Time Communication Hub
* **Low-Latency Chat**: Integrated group messaging powered by FastAPI WebSockets.
* **Scalable Brokerage**: Backed by Redis Pub/Sub to synchronize multi-instance server clusters.
* **Persistent Storage**: Messages backed by PostgreSQL, dynamically fetched on viewport scroll.

### 💰 Subscription Monetization
* **Tier Management**: Teachers define up to 3 subscription tiers per group.
* **Payment Integration**: Razorpay API integrations handle student subscription transactions.
* **Revenue Analytics**: Interactive charts display income trends, active members, renewal rates, and payment logs.

---

## 🏗️ System Design Architecture

```mermaid
graph TD
    subgraph Clients [Clients Layer]
        Web[React 18 / Vite 7 Web App]
        Android[Android Mobile App]
    end

    subgraph AuthServer [ClassBuddy OAuth2 Authorization Server]
        OAuth_Endpoint[OAuth2 /oauth Endpoints]
        PKCE_Val[PKCE Code & Challenge Verifier]
        Cookie_Mgr[HttpOnly Cookie Setter]
        Token_Family[Token Family Reuse Detector]
    end

    subgraph API_Gateway [FastAPI Backend Core]
        FA[FastAPI Server]
        RL[SlowAPI Rate Limiter]
        Auth_Dep[OAuth2 User / Group Guard]
        Teacher_Guard[require_teacher_group Dependency]
        WS_Manager[WebSocket Manager]
    end

    subgraph Realtime_PubSub [Real-Time Broker]
        Redis[Redis Pub/Sub & Caching]
    end

    subgraph Async_Worker [Background Jobs Engine]
        Inngest[Inngest Event Queue]
    end

    subgraph Database_Layer [Data Storage]
        DB[(PostgreSQL - NeonDB)]
        Alembic[Alembic Database Migrations]
    end

    subgraph AI_Engine [AI & Agentic Workflows]
        LG[LangGraph State Charts]
        LLM[Gemini 2.5 Flash]
        Tavily[Tavily Search API]
    end

    subgraph External_Integrations [Third-Party Services]
        RP[Razorpay Checkout]
        CL[Cloudinary CDN]
    end

    Web <-->|HttpOnly Cookies / REST| FA
    Android <-->|Bearer Token / REST| FA
    Web <-->|OAuth2 PKCE Flow| OAuth_Endpoint
    Android <-->|OAuth2 PKCE Flow| OAuth_Endpoint
    OAuth_Endpoint --> PKCE_Val
    OAuth_Endpoint --> Cookie_Mgr
    OAuth_Endpoint --> Token_Family
    FA --> Auth_Dep
    Auth_Dep --> Teacher_Guard
    Teacher_Guard <-->|Verify Group Existence| DB
    FA <--> WS_Manager
    WS_Manager <--> Redis
    FA <--> DB
    FA <--> Redis
    FA <--> RP
    FA <--> CL
    FA -->|Enqueue Background Events| Inngest
    Inngest -->|Process & Save| DB
    Inngest <-->|Execute Graph State| LG
    LG <-->|Call LLM Function| LLM
    LG <-->|Web Search Context| Tavily
```

---

## 🔄 Sequence Workflows

### 1. OAuth2 PKCE Authentication Flow (Web & Android)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Web / Android App
    participant OAuth as OAuth2 Authorization Server
    participant DB as PostgreSQL DB

    User->>Client: Enter Email & Password
    Client->>Client: Generate PKCE code_verifier & code_challenge (S256)
    Client->>OAuth: POST /api/v1/oauth/authorize/login (credentials, client_id, challenge)
    OAuth->>DB: Validate user & generate authorization_code
    OAuth-->>Client: Return authorization_code
    Client->>OAuth: POST /api/v1/oauth/token (grant_type=authorization_code, verifier)
    OAuth->>OAuth: Verify PKCE verifier against code_challenge

    alt Web Client (classbuddy-web)
        OAuth-->>Client: Set HttpOnly Secure Cookies (access_token, refresh_token)
    else Android Client (classbuddy-android)
        OAuth-->>Client: Return JSON { access_token, refresh_token, token_type: "Bearer" }
    end

    Client->>OAuth: GET /api/v1/oauth/userinfo (Cookie or Bearer)
    OAuth-->>Client: Return User Profile (sub, email, role)
```

### 2. Teacher Group Onboarding & Access Control

```mermaid
sequenceDiagram
    autonumber
    actor Teacher
    participant Client as React Client
    participant API as FastAPI Backend
    participant Guard as require_teacher_group
    participant DB as PostgreSQL DB

    Teacher->>Client: Navigate to /t-dashboard/home
    Client->>API: GET /api/v1/teacher/group-status
    API->>DB: Query TeacherInsight by user_id
    DB-->>API: group_count = 0 (has_group = false)
    API-->>Client: { "has_group": false, "group_count": 0 }

    Client->>Teacher: Render "Create Your First Group" Onboarding UI

    opt Teacher tries to access protected endpoint directly (e.g. POST /notes/)
        Client->>API: POST /api/v1/notes/
        API->>Guard: Execute require_teacher_group
        Guard->>DB: Check TeacherInsight existence
        DB-->>Guard: No group found
        Guard-->>Client: HTTP 403 Forbidden { "code": "TEACHER_GROUP_REQUIRED" }
        Client->>Teacher: Show Toast & Redirect to /t-dashboard/home
    end

    Teacher->>Client: Click "Create Your First Group" & Submit /t-insight form
    Client->>API: POST /api/v1/insights/ (group_name, group_des, image)
    API->>DB: Save TeacherInsight
    DB-->>API: Group Created
    API-->>Client: 201 Created
    Client->>Client: Redux setHasGroup(true) & Navigate /t-dashboard/home
    Client->>Teacher: Render Full Teacher Dashboard
```
---

## 🔄 Application Workflows

### 1. AI-Powered Notes Generation (LangGraph Orchestration)
Teachers can generate exhaustive, structured Markdown study guides using agentic multi-step reasoning. LangGraph manages the state machine, coordinating external search execution and context compilation before LLM notes synthesis.

```mermaid
sequenceDiagram
    autonumber
    actor Teacher
    participant Client as React Client
    participant API as FastAPI Backend
    participant LG as LangGraph AI Agent
    participant Tavily as Tavily Search API
    participant Gemini as Gemini 2.5 Flash
    participant DB as PostgreSQL DB

    Teacher->>Client: Input Study Topic (e.g., "Quantum Computing")
    Client->>API: POST /api/v1/notes (Topic & User Details)
    API->>LG: Invoke notes_graph(topic)
    activate LG
    LG->>Tavily: Fetch search results/context
    Tavily-->>LG: Search results (titles & content snippets)
    LG->>Gemini: Send prompt with research data & markdown guidelines
    Gemini-->>LG: Generated Markdown notes
    deactivate LG
    LG-->>API: Notes Content
    API->>DB: Save Generated Notes to PostgreSQL
    DB-->>API: Saved Notes Object
    API-->>Client: Return Markdown Notes & Metadata
    Client->>Teacher: Render Notes in rich MD Editor/Viewer
```

### 2. Scalable Real-Time Messaging Workflow
ClassBuddy features a horizontally scalable message delivery architecture. WebSockets manage active client connections, and Redis Pub/Sub broadcasts incoming messages to all server instances, ensuring real-time sync across web and mobile viewports.

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Client1 as Student Client
    participant WS1 as WebSocket Server (Instance 1)
    participant Redis as Redis Pub/Sub
    participant WS2 as WebSocket Server (Instance 2)
    participant Client2 as Teacher Client
    participant DB as PostgreSQL DB

    Student->>Client1: Send Message ("Hello Class")
    Client1->>WS1: WebSocket Message Frame
    WS1->>DB: Persist Message in DB (Background task)
    WS1->>Redis: Publish to channel "group_messages_{group_id}"
    Redis-->>WS1: Broadcast to active subscribers
    Redis-->>WS2: Broadcast to active subscribers
    WS2->>Client2: WebSocket Message Frame (Push Delivery)
    Client2->>Client2: Render message instantly
```

### 3. Event-Driven Background Evaluation & Insights (Inngest)
For intensive processing like assignment grading, mock interview analytics, or career interest graph syncs, the system offloads jobs to an asynchronous serverless worker queue:
1. **Trigger**: An event (`student/industry.generate` or a weekly Cron scheduler) is dispatched to Inngest.
2. **AI Analysis**: Inngest fetches the required model data, calls the LangGraph API to run the specific profile engine (e.g., `industry_graph`), and generates tailored metrics.
3. **Database & Cache Sync**: The result is saved directly into PostgreSQL, and the corresponding user caching keys on Redis are invalidated to guarantee updated reads.
---

## 🛠️ Tech Stack

### **Frontend**
* **Framework**: [React 18.3](https://react.dev/) + [Vite 7.1](https://vitejs.dev/)
* **Language**: [TypeScript 5.8](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
* **State**: [Redux Toolkit](https://redux-toolkit.js.org/) + [Redux Persist](https://github.com/rt2zz/redux-persist)
* **Data Fetching**: [TanStack Query v5](https://tanstack.com/query) + [Axios](https://axios-http.com/) (with automatic 401 cookie refresh queue)
* **UI Controls**: [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/) + [Sonner Toasts](https://sonner.emilkowal.ski/)
* **Rich Markdown**: [React MD Editor](https://github.com/uiwjs/react-md-editor)
* **Charts**: [Recharts](https://recharts.org/)

### **Backend**
* **Framework**: [FastAPI 0.109](https://fastapi.tiangolo.com/) (Asynchronous Python 3.10+)
* **Auth System**: Custom OAuth 2.0 Authorization Server with PKCE & PyJWT
* **Database**: [PostgreSQL](https://www.postgresql.org/) (hosted on NeonDB)
* **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) & [Alembic](https://alembic.sqlalchemy.org/)
* **Rate Limiting**: [SlowAPI](https://github.com/laurentS/slowapi)

### **AI & Background Engine**
* **Agentic Framework**: [LangChain](https://www.langchain.com/) & [LangGraph](https://langchain-ai.github.io/langgraph/)
* **LLM Engine**: Google Gemini 2.5 Flash
* **Search Context**: Tavily Search API
* **Asynchronous Jobs**: [Inngest](https://www.inngest.com/)

### **Infrastructure & Services**
* **Payments**: [Razorpay API](https://razorpay.com/)
* **Media Cloud**: [Cloudinary](https://cloudinary.com/)
* **Real-time Broker**: [Redis Pub/Sub](https://redis.io/)
* **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 📂 Project Structure

```bash
ClassBuddy/
├── client/                   # React 18 Frontend Application
│   ├── src/
│   │   ├── components/       # UI Primitives & Role Protected Routes
│   │   ├── helper/           # Axios client (withCredentials & 401 queue), OAuth PKCE utils
│   │   ├── page/             # Page view containers
│   │   │   ├── ChatDashboard/# Real-time WebSocket chat views
│   │   │   ├── Dashboard/    # Student views (notes, docs, career, quiz)
│   │   │   └── Teacher/      # Teacher views (THome onboarding, TInsight group creation)
│   │   ├── redux/            # RTK Slice state (authSlice, tSlice, noteSlice)
│   │   └── routes/           # React Router v6 definitions with requireGroup guards
│   ├── package.json
│   └── vite.config.ts
│
├── server/                   # FastAPI Backend & OAuth 2.0 Authorization Server
│   ├── alembic/              # Database schema migrations
│   ├── app/
│   │   ├── ai/               # LangGraph multi-step agents
│   │   ├── api/v1/endpoints/ # API Routers:
│   │   │   ├── oauth.py      # OAuth2 authorization, token, revoke & userinfo
│   │   │   ├── teacher.py    # Group status endpoint (/teacher/group-status)
│   │   │   ├── teacherInsight.py # Group creation (/insights/)
│   │   │   └── notes.py, assignment.py, docsupload.py, subscription.py...
│   │   ├── config/           # Database & App environment configuration
│   │   ├── dependencies/     # require_teacher_group & OAuth get_current_user dependencies
│   │   ├── models/           # SQLAlchemy Data Models (User, TeacherInsight, OAuthClient, etc.)
│   │   ├── services/         # OAuthService, NotesService, Razorpay, SocketManager
│   │   └── main.py           # FastAPI lifespan & exception handlers
│   ├── tests/                # Automated pytest suite (test_oauth.py, test_teacher_onboarding.py)
│   ├── Dockerfile
│   └── pyproject.toml
│
├── docker-compose.yml        # Docker Multi-Container Configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+)
* **Python** (v3.10+)
* **uv** or **pip**
* **Docker** & **Docker Compose** (optional)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Sandeep-singh-99/ClassBuddy.git
cd ClassBuddy
```

### 2. Set Up Environment Variables
Create a `.env` file in the `server/` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# JWT & OAuth Secrets
JWT_SECRET_KEY=your_secure_random_hash_key
JWT_ALGORITHM=HS256
OAUTH_ISSUER=classbuddy-auth-server

# Cookie Config (Web Client)
COOKIE_SECURE=false # Set to true in HTTPS production
COOKIE_SAMESITE=lax
COOKIE_DOMAIN=localhost

# Media Uploads (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI Models & Agents
GOOGLE_API_KEY=your_google_gemini_api_key
TAVILY_API_KEY=your_tavily_search_api_key

# Redis Pub/Sub
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USER=default
REDIS_PASSWORD=your_redis_password

# Razorpay Integration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# CORS
CORS_ORIGINS=http://localhost:5173
```

---

### 3. Run Automated Tests

#### Backend Pytest Suite
```bash
cd server
uv run pytest -v
```

---

### 4. Run Locally

#### A. Backend API Server
```bash
cd server
uv run uvicorn app.main:app --reload --port 8000
```

#### B. Frontend Web Client
```bash
cd client
npm install
npm run dev
```

* **Frontend App**: [http://localhost:5173](http://localhost:5173)
* **Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🤝 Contributing

Contributions are welcome!
1. **Fork** the project.
2. **Create** your feature branch (`git checkout -b feature/MyFeature`).
3. **Commit** your changes (`git commit -m 'Add MyFeature'`).
4. **Push** to the branch (`git push origin feature/MyFeature`).
5. **Open** a Pull Request.
