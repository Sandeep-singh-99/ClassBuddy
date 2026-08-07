# ClassBuddy 🎓

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
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

**ClassBuddy** is a next-generation, premium full-stack educational ecosystem that connects teachers and students through intelligent AI agents, real-time communication systems, interactive study dashboards, and built-in subscription monetization. It transforms standard classrooms into dynamic, AI-assisted workspaces.

---

## 🌐 App Version

You can find the App application here:

**🔗 https://github.com/Sandeep-singh-99/ClassBuddy_App**

---

![ClassBuddy Mockup](./screenshot/Screenshot%202026-04-04%20231251.png)
![ClassBuddy Chat](./screenshot/Screenshot%202026-04-04%20231313.png)

---
## ✨ Key Features

### 🤖 Multi-Agent AI System
* **Automated Notes Studio**: Autonomously researches topics using Tavily Search, gathers web resources, and outputs structured study materials complete with summaries and key takeaways.
* **Smart Assignment Architect**: Generates customized assignments based on topics, reading levels, and files uploaded.
* **AI Evaluation Engine**: Evaluates student submissions, grading their code and responses, while generating personalized study reviews.
* **Mock Interview prep**: Interactive terminal simulator generating dynamic interview questions matched to specific career streams or industries.

### 🏫 Classroom Groups & Collaboration
* **Group Management**: Teachers can create specific groups (e.g., "AP Computer Science") and secure access using enrollment links or subscriptions.
* **Content Hub**: Upload and share documents, assignments, and slides directly to a centralized feed.
* **Resource Catalog**: Students browse available teachers, preview curricula, and view active study categories.

### 💬 Real-Time Communication Hub
* **Low-Latency Chat**: Integrated group chat room using FastAPI WebSockets.
* **Scalable Brokerage**: Backed by Redis Pub/Sub to synchronize multi-instance deployments.
* **Persistent History**: Instant fallback to PostgreSQL, loading chat histories dynamically on viewport scroll.

### 💰 Subscription Monetization
* **Monetization Portals**: Teachers can easily define subscription tiers (up to 3 customized plans).
* **Payment Integration**: Razorpay API integrations process student subscription transactions.
* **Earnings Analytics**: Interactive charts display income trends, active members, renewal rates, and payment logs.

### 📊 Insight Dashboards
* **Teacher Dashboard**: Monitor group enrollments, average grades, pending submissions, and payment statistics.
* **Student Career Hub**: Visualize career interest graphs, weekly review performance, and curated industry recommendations.

---

## 🏗️ System Design Architecture

ClassBuddy leverages a modern, distributed architecture to handle CPU-bound AI operations, low-latency messaging, and scalable background tasks concurrently without blocking client transactions.

```mermaid
graph TD
    subgraph Frontend [React Web Client]
        RC[React 18 / Vite 7 Client]
        RT[Redux State / React Query]
        WS_Client[WebSocket Connection]
    end

    subgraph API_Gateway [FastAPI Backend Router]
        FA[FastAPI Server]
        RL[SlowAPI Rate Limiter]
        JWT[JWT Authentication]
        WS_Manager[Socket Manager]
    end

    subgraph Realtime_PubSub [Real-Time Broker]
        Redis[Redis Pub/Sub & Caching]
    end

    subgraph Async_Worker [Background Jobs Engine]
        Inngest[Inngest Event Queue]
    end

    subgraph Database_Layer [Data Storage]
        DB[(PostgreSQL - Hosted on Neon)]
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

    RC <-->|HTTP REST / JSON payload| FA
    WS_Client <-->|Persistent WebSockets| WS_Manager
    FA --> RL
    FA --> JWT
    WS_Manager <--> Redis
    FA <--> DB
    FA <--> Redis
    FA <--> RP
    FA <--> CL
    FA -->|Enqueue Background Events| Inngest
    Inngest -->|Process & Save| DB
    Inngest -->|Invalidate Cache| Redis
    Inngest <-->|Execute Graph State| LG
    LG <-->|Call LLM Function| LLM
    LG <-->|Web Context Retrieval| Tavily
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
* **Library/Framework**: [React 18.3](https://react.dev/)
* **Build Engine**: [Vite 7.1](https://vitejs.dev/) with [TypeScript 5.8](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
* **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) + [Redux Persist](https://github.com/rt2zz/redux-persist)
* **API Handlers**: [TanStack Query v5](https://tanstack.com/query) + [Axios](https://axios-http.com/)
* **UI Primitives**: [Radix UI](https://www.radix-ui.com/) + [Lucide React](https://lucide.dev/)
* **Rich Text Editing**: [React MD Editor](https://github.com/uiwjs/react-md-editor)
* **Visualization**: [Recharts](https://recharts.org/)

### **Backend**
* **Application Framework**: [FastAPI 0.109](https://fastapi.tiangolo.com/) (Asynchronous Python 3.10+)
* **Database Driver**: [PostgreSQL](https://www.postgresql.org/) (via NeonDB)
* **ORM Layer**: [SQLAlchemy](https://www.sqlalchemy.org/)
* **Database Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
* **Rate Limiting**: [SlowAPI](https://github.com/laurentS/slowapi) (token bucket rate limiter)
* **Authentication**: PyJWT (JSON Web Tokens)

### **AI & Background Processing**
* **AI Orchestrator**: [LangChain](https://www.langchain.com/) & [LangGraph](https://langchain-ai.github.io/langgraph/)
* **Foundation LLM**: Google Gemini 2.5 Flash (via `langchain-google-genai`)
* **Search Engine**: Tavily Search API
* **Workflow Scheduler & Queue**: [Inngest](https://www.inngest.com/)

### **Services & DevOps**
* **Payment Gateway**: [Razorpay SDK](https://razorpay.com/)
* **Media Server**: [Cloudinary Python SDK](https://cloudinary.com/)
* **Real-time Synchronization & Caching**: [Redis](https://redis.io/)
* **Deployment**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 📂 Project Structure

```bash
ClassBuddy/
├── client/                   # React 18 Frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Common reusable components
│   │   ├── page/             # Page view containers
│   │   │   ├── ChatDashboard/# Live chat dashboards
│   │   │   ├── Dashboard/    # Student portals (career, mock interviews, payments)
│   │   │   └── Teacher/      # Teacher portals (notes study, payments, grading insights)
│   │   ├── redux/            # RTK Slice configurations
│   │   ├── services/         # API service callers
│   │   ├── App.tsx           # Route layout entries
│   │   └── index.css         # Tailwind 4 configuration
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration
│
├── server/                   # FastAPI Backend
│   ├── alembic/              # Database schema migrations
│   ├── app/
│   │   ├── ai/               # LangGraph state files (notes, assignments, interviews)
│   │   ├── api/v1/endpoints/ # API router paths (auth, chat, insights, subscriptions)
│   │   ├── config/           # App/DB configurations
│   │   ├── inngest/          # Inngest asynchronous cron/event handlers
│   │   ├── models/           # SQLAlchemy schemas (users, subscriptions, chat)
│   │   ├── services/         # Third-party service layers (Razorpay, WebSockets)
│   │   └── main.py           # App lifespan & route registrations
│   ├── Dockerfile            # Container build recipe
│   ├── pyproject.toml        # Poetry/Uvicorn configuration
│   └── requirements.txt      # Python dependencies
│
├── docker-compose.yml        # Multi-container local deployment
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18 or higher)
* **Python** (v3.10 or higher)
* **Docker** & **Docker Compose** (recommended for production-like environments)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Sandeep-singh-99/ClassBuddy.git
cd ClassBuddy
```

### 2. Configure Environment Variables
Create a `.env` file in your `server/` directory:

```env
# Database Settings
DATABASE_URL=postgresql://user:password@host:port/dbname

# Authentication
JWT_SECRET_KEY=your_secure_random_hash_key

# Cloudinary (Media upload)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI Models & Agents
GOOGLE_API_KEY=your_google_gemini_api_key
TAVILY_API_KEY=your_tavily_search_api_key

# Caching & Real-Time Sync
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USER=default
REDIS_PASSWORD=your_redis_password

# Payment Gateways (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Inngest Asynchronous Engine
INNGEST_SIGNING_KEY=your_inngest_signing_key # Optional for local dev
INNGEST_DEV=1 # Set to 1 for local development
CORS_ORIGINS=http://localhost:5173
```

---

### 3. Run via Docker Compose (Recommended)
This runs the frontend, backend API, and handles local network proxying automatically.

```bash
docker-compose up --build
```
* **Frontend Access**: [http://localhost:5173](http://localhost:5173)
* **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 4. Manual Local Setup

#### A. Run Backend API
```bash
cd server
python -m venv venv

# Activate Virtualenv (Windows)
venv\Scripts\activate

# Activate Virtualenv (macOS/Linux)
source venv/bin/activate

# Install dependencies and start server
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### B. Start Inngest Dev Server (For Background Jobs)
Inngest handles task scheduling and cron jobs locally via its dev server:
```bash
npx inngest-cli@latest dev -u http://localhost:8000/api/v1/inngest
```

#### C. Run Frontend Dev Server
```bash
cd client
npm install
npm run dev
```

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create.
1. **Fork** the Project.
2. **Create** your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`).
4. **Push** to the Branch (`git push origin feature/AmazingFeature`).
5. **Open** a Pull Request.


