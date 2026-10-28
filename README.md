# ResumeAI — AI-Powered Resume Simulator

> Upload your resume, get AI-powered analysis, practice mock interviews, and land your dream job.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![Express](https://img.shields.io/badge/Express.js-TypeScript-blue?logo=express) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-orange?logo=openai) ![Gemini](https://img.shields.io/badge/Google-Gemini-blue?logo=google)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Resume Parsing** | Upload PDF or DOCX — text extracted instantly |
| 🎯 **AI Analysis** | 6-dimension scoring + ATS compatibility check |
| 🤖 **Mock Interviews** | AI asks questions tailored to your resume |
| ✏️ **Improvement Suggestions** | Before/after rewrites for each section |
| 🔄 **Dual AI Toggle** | Switch between OpenAI GPT-4o and Gemini 1.5 Pro |
| 🔐 **Auth** | JWT + Google OAuth sign-in |

---

## 🏗️ Architecture

```
resume-simulator/
├── frontend/          # Next.js 15 + React 19 + Tailwind CSS
│   ├── app/           # App Router pages
│   ├── components/    # UI components (Shadcn + custom)
│   ├── context/       # Auth context
│   ├── lib/           # API client, utils
│   └── types/         # TypeScript types
│
├── backend/           # Express.js + TypeScript API
│   ├── src/
│   │   ├── models/    # Mongoose: User, Resume, Interview
│   │   ├── services/  # AI (OpenAI/Gemini), Parser, Resume, Interview
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── middleware/ # JWT auth, Multer upload
│   └── uploads/       # Temporary file storage
│
├── docker-compose.yml # Full stack orchestration
└── .env.example       # Environment variables template
```

---

## 🚀 Quick Start (Local Dev)

### Prerequisites
- Node.js 20+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- OpenRouter API key

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Frontend
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local
```

**Required environment variables:**

| Variable | Where | Description |
|----------|-------|-------------|
| `MONGODB_URI` | backend/.env | MongoDB connection string |
| `JWT_SECRET` | backend/.env | Random secret string (32+ chars) |
| `OPENROUTER_API_KEY` | backend/.env | From [OpenRouter](https://openrouter.ai/keys) |
| `OPENROUTER_BASE_URL` | backend/.env | Defaults to `https://openrouter.ai/api/v1` |
| `OPENROUTER_MODEL` | backend/.env | Model ID; defaults to `openrouter/free` in Docker |
| `GOOGLE_CLIENT_ID` | backend/.env | Google OAuth (optional) |
| `GOOGLE_CLIENT_SECRET` | backend/.env | Google OAuth (optional) |
| `NEXT_PUBLIC_API_URL` | frontend/.env.local | `http://localhost:5000/api` |

### 3. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🐳 Docker Deployment

### 1. Set up environment

```bash
cp .env.example .env
# Edit .env with all required values
```

### 2. Build and run

```bash
docker compose up --build -d
```

Services:
- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:5000
- **MongoDB** → localhost:27017

### 3. Stop

```bash
docker compose down
# To also remove volumes (data):
docker compose down -v
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/auth/google` | — | Initiate Google OAuth |

### Resumes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/resume/upload` | ✅ | Upload + analyze resume (multipart/form-data) |
| GET | `/api/resume/` | ✅ | List all user's resumes |
| GET | `/api/resume/:id` | ✅ | Get full analysis |
| DELETE | `/api/resume/:id` | ✅ | Delete resume |

**Upload fields:**
- `resume` — File (PDF or DOCX, max 5MB)
- `provider` — `"openai"` | `"gemini"` (default: `"openai"`)

### Interviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/interview/start` | ✅ | Start interview session |
| POST | `/api/interview/:id/respond` | ✅ | Send answer, get next question |
| GET | `/api/interview/` | ✅ | List all interviews |
| GET | `/api/interview/:id` | ✅ | Get interview + results |

---

## 🔑 Setting Up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID and Secret to your `backend/.env`

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** + **Shadcn/UI** — Design system
- **Framer Motion** + **GSAP** — Animations
- **React Hook Form** + **Zod** — Form validation
- **Axios** — API client

### Backend
- **Express.js** + **TypeScript**
- **MongoDB** + **Mongoose** — Database
- **JWT** + **Passport.js** — Authentication
- **Multer** — File upload handling
- **pdf-parse** + **Mammoth** — Document parsing
- **OpenAI SDK** + **@google/generative-ai** — AI integration

---

## 📁 Key Files

| File | Description |
|------|-------------|
| [`backend/src/services/ai.service.ts`](./backend/src/services/ai.service.ts) | OpenAI + Gemini abstraction layer |
| [`backend/src/services/resume.service.ts`](./backend/src/services/resume.service.ts) | Resume analysis prompts |
| [`backend/src/services/interview.service.ts`](./backend/src/services/interview.service.ts) | Interview conversation + scoring |
| [`backend/src/app.ts`](./backend/src/app.ts) | Express app + Google OAuth setup |
| [`frontend/context/AuthContext.tsx`](./frontend/context/AuthContext.tsx) | Auth state management |
| [`frontend/lib/api.ts`](./frontend/lib/api.ts) | Axios client with JWT interceptor |

---

## 📝 License

MIT
