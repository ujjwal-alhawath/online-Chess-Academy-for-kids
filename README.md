# Kids Chess & Strategic Thinking Academy

> **Learn chess. Think strategically. Grow confidently.**

A modern, gamified web platform designed to teach children chess fundamentals, tactical pattern recognition, strategic decision-making, and emotional resilience through guided reflection and friendly competition.

---

## 1. Project Overview

**Kids Chess & Strategic Thinking Academy** combines interactive chess practice with structured learning milestones, gamification (XP, streaks, achievement badges), tournament play, and non-clinical emotional self-reflection.

The platform provides dedicated, tailored experiences for four roles:
- **Student**: Child-friendly, gamified learning with daily tactics, AI sparring bots, level progression, and post-game reflection.
- **Teacher / Coach**: Class cohort management, lesson assignments, tactical puzzle creation, and student learning history.
- **Parent**: Educational monitoring, activity streaks, practice hours, and constructive emotional growth trends.
- **Admin**: Platform oversight, user management, and system-level diagnostics.

---

## 2. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Real-Time / Chess (Prepared)**: Socket.IO, chess.js, Stockfish WebAssembly
- **Tooling & Quality**: Git, ESLint, TypeScript Strict Mode, Concurrently

---

## 3. Project Structure

```text
online-chess-academy/
├── frontend/
│   ├── app/
│   │   ├── globals.css         # Global Tailwind styles & tokens
│   │   ├── layout.tsx          # Root HTML shell & metadata
│   │   └── page.tsx            # Modern Academy landing page
│   ├── components/             # Reusable UI components
│   │   ├── Navbar.tsx          # Academy header & navigation
│   │   ├── Hero.tsx            # Hero with live game mockup & stats
│   │   ├── Features.tsx        # 6 core academy capabilities
│   │   ├── HowItWorks.tsx      # 4-step learning cycle
│   │   ├── LearningPath.tsx    # 3-tier curriculum preview
│   │   ├── PracticeArena.tsx   # Tactics & AI bot difficulty tiers
│   │   ├── TournamentsOverview.tsx # Friendly events & sportsmanship
│   │   ├── ProgressSection.tsx # XP, streaks, and badge showcase
│   │   ├── CallToAction.tsx    # Enrollment action section
│   │   └── Footer.tsx          # Legal disclaimer & academy links
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts          # Validated environment configuration
│   │   │   └── database.ts     # Mongoose connection & disconnect handlers
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts # Centralized Express error handler
│   │   │   └── notFoundHandler.ts # 404 JSON fallback handler
│   │   ├── routes/
│   │   │   └── health.routes.ts # /api/health endpoint
│   │   ├── controllers/        # (Prepared for subsequent phases)
│   │   ├── models/             # (Prepared for Phase 2)
│   │   └── server.ts           # Express application & lifecycle management
│   ├── tsconfig.json
│   ├── eslint.config.mjs
│   ├── package.json
│   └── .env.example
│
├── .gitignore                  # Production Git exclusions
├── package.json                # Monorepo root scripts & dev orchestration
└── README.md                   # Project documentation
```

---

## 4. Prerequisites

- **Node.js**: `v20.x` or higher (tested on `v23.1.0`)
- **npm**: `v10.x` or higher
- **MongoDB**: Local MongoDB instance running on port `27017` or a MongoDB Atlas URI
- **Git**: Installed and configured

---

## 5. Environment Setup

### Backend Environment Configuration
Copy the sample environment file in `backend/`:
```bash
cp backend/.env.example backend/.env
```

Contents of `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/chess_academy
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

### Frontend Environment Configuration
Copy the sample environment file in `frontend/`:
```bash
cp frontend/.env.example frontend/.env.local
```

Contents of `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 6. Installation

Install all dependencies across the workspace:

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend && npm install && cd ..

# Frontend dependencies
cd frontend && npm install && cd ..
```

---

## 7. Running The Application

### Option A: Run Both Services Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```
- **Frontend**: Accessible at `http://localhost:3000`
- **Backend API**: Accessible at `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

### Option B: Run Services Individually

**Backend only:**
```bash
npm run dev:backend
# or: cd backend && npm run dev
```

**Frontend only:**
```bash
npm run dev:frontend
# or: cd frontend && npm run dev
```

---

## 8. Verification & Diagnostics

### Health Check Endpoint
```bash
curl http://localhost:5000/api/health
```
Response:
```json
{
  "success": true,
  "message": "Chess Academy API is running",
  "timestamp": "2026-11-12T08:32:12.484Z",
  "environment": "development",
  "database": "connected"
}
```

### Type Checking & Linting
Run checks across all workspaces:
```bash
# TypeScript verification
npm run typecheck

# Code quality linting
npm run lint
```

### Production Build
```bash
npm run build
```

---

## 9. Current Implementation Status

- **Phase 1 (Complete)**: Clean repository architecture, Next.js 14 frontend landing page, Express TypeScript backend with verified MongoDB connection, centralized error middleware, and health checking.
- **Phase 2 (Next)**: Database schema definitions (Users, Profiles, Lessons, Puzzles, Games, Tournaments, Reflections).
- **Phases 3 - 12**: Incremental rollout of Auth, Dashboards, Chess Engine, Tactics, Gamification, and Role Portals.

