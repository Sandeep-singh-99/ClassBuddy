# ClassBuddy 🎓

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)

**ClassBuddy** is a comprehensive full-stack web application designed to revolutionize classroom collaboration. It bridges the gap between students and teachers by facilitating seamless note sharing, real-time communication, and AI-powered learning assistance.

![ClassBuddy Screenshot](./screenshot/Screenshot%202025-12-03%20211554.png)

---

## ✨ Key Features

### 🤖 **AI-Powered Teacher Notes**

- **Intelligent Generation**: Teachers can leverage **Gemini 2.5 Flash** and **Tavily Search** to auto-generate comprehensive study notes.
- **Agentic Workflow**: Built on **LangChain** and **LangGraph**, the system performs autonomous multi-step reasoning to search, summarize, and structure content.
- **Smart Management**: Full CRUD capabilities for managing generated notes.

### 🏫 **Classroom Collaboration**

- **Group Dynamics**: Teachers can create dedicated class groups; students join to access exclusive content.
- **Resource Sharing**: Instantly share notes, assignments, and resources within the group.
- **Real-time Chat**: Integrated chat system for instant doubts resolution and announcements.

### 💬 **Real-Time Chat System**

- **High-Performance Architecture**: Built on **Redis Pub/Sub** to handle real-time message broadcasting across multiple instances.
- **WebSocket Integration**: Uses **FastAPI WebSockets** for low-latency, bi-directional communication.
- **Reliability**: Messages are persisted in **PostgreSQL** ensuring no data loss, while Redis handles ephemeral real-time delivery.
- **Smart Caching**: Implements a caching strategy to optimize message retrieval and reduce database load.
- **Cross-Platform**: Fully synchronized experience between Web and Mobile interfaces.

### � **Enterprise-Grade Security**

- **Role-Based Access**: Distinct portals for **Teachers** and **Students** with tailored permissions.
- **Secure Auth**: Robust **JWT-based authentication** ensures data privacy and secure API access.
- **Rate Limiting**: Implemented **SlowAPI** based rate limiting to prevent abuse and ensure fair usage.

### ☁️ **Modern Cloud Infrastructure**

- **Scalable Database**: Powered by **PostgreSQL (NeonDB)** for high availability.
- **Media Management**: Seamless image and file handling via **Cloudinary**.
- **Containerized**: Fully **Dockerized** for consistent development and deployment environments.

---

## 🛠️ Tech Stack

### **Frontend**

- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

### **Backend**

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via NeonDB)
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **AI/LLM**: [LangChain](https://www.langchain.com/), [LangGraph](https://langchain-ai.github.io/langgraph/)
- **Authentication**: JWT (JSON Web Tokens)

### **DevOps**

- **Containerization**: Docker & Docker Compose

---

## 📂 Project Structure

```bash
ClassBuddy/
├── client/                 # React 19 Frontend
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
├── server/                 # FastAPI Backend
│   ├── app/
│   ├── alembic/
│   └── requirements.txt
├── docker-compose.yml      # Container orchestration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **Python** (v3.10+)
- **Docker** & **Docker Compose** (Optional but recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/Sandeep-singh-99/ClassBuddy.git
cd ClassBuddy
```

### 2. Environment Setup

Create a `.env` file in the `server/` directory:

```env
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET_KEY=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
```

### 3. Run with Docker (Recommended)

The easiest way to start the application is using Docker Compose.

```bash
docker-compose up --build
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:8000](http://localhost:8000)

### 4. Manual Setup

#### Backend (FastAPI)

```bash
cd server
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend (React)

```bash
cd client
npm install
npm run dev
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

---
