# 🏙️ Civic Reporting Platform

A full-stack web application that lets citizens report infrastructure issues (potholes, broken street lights, water leaks, garbage) with photos and map locations, track their resolution status in real time, upvote reports to raise priority, and chat with an AI assistant.

---

## ✨ Features

### Citizens
- **Create reports** with a photo upload, category auto-classification (AI), and interactive map location picker
- **Browse & filter reports** by status / category on a live map (Leaflet)
- **Upvote** reports — higher engagement means higher priority
- **Track report status** with a full timeline of status changes and admin notes
- **Resolution feedback** — rate how well a reported issue was resolved
- **Real-time notifications** via Socket.IO when a report status changes
- **AI chatbot** — answers any question (platform-related or general), bilingual (Arabic/English)
- **Leaderboard** — gamified trust score for active citizens
- **Full i18n** — Arabic & English UI (react-i18next)

### Admins
- **Dashboard** with statistics (total reports, resolution rate, charts via Recharts)
- **Manage all reports** — update status (`pending → in_progress → resolved / rejected`) with notes
- **Role-based access control** (`citizen` / `supervisor` / `admin`)
- Seeded default admin account on first run

### Security
- JWT authentication (passwords hashed with bcrypt)
- Rate limiting on auth and chat endpoints
- Security headers via Helmet
- CORS restricted to the frontend origin

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4 |
| **Routing** | React Router DOM 7 |
| **HTTP client** | Axios |
| **Maps** | Leaflet + React-Leaflet |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **i18n** | react-i18next |
| **Real-time** | Socket.IO (client + server) |
| **Backend** | Node.js, Express 4 |
| **Database** | SQLite (development) / PostgreSQL (production-ready via `DATABASE_URL`) |
| **ORM** | Sequelize 6 |
| **Auth** | JSON Web Tokens (jsonwebtoken), bcryptjs |
| **File uploads** | Multer (local `/uploads` storage) |
| **AI** | Google Gemini API (`@google/generative-ai`) with keyword-matching offline fallback |
| **Validation** | Zod |
| **Dev tooling** | Concurrently (runs backend + frontend together), Nodemon-style `node --watch`, ESLint-compatible oxlint |

---

## 📁 Folder Structure

```
Civic Reporting Platform/
│
├── package.json                  # Root scripts (concurrently: runs backend + frontend)
├── README.md
│
├── backend/
│   ├── server.js                 # ★ Main entry point — Express app + Socket.IO + route registration
│   ├── package.json              # Backend dependencies & scripts
│   ├── .env                      # Environment variables (secrets — NOT committed)
│   ├── .env.example              # Template for required environment variables
│   ├── .sequelizerc              # Sequelize CLI config path
│   ├── database.sqlite           # Dev database file (auto-created)
│   │
│   ├── config/
│   │   └── db.js                 # Sequelize instance (SQLite in dev / Postgres if DATABASE_URL set)
│   │
│   ├── models/                   # Sequelize models + associations
│   │   ├── index.js              # Model registry & relationships
│   │   ├── User.js               # Users (citizen/supervisor/admin, trust score)
│   │   ├── Report.js             # Civic issue reports (location, photo, category, status)
│   │   ├── Upvote.js             # User ⇄ report upvotes
│   │   ├── StatusUpdate.js       # Status-change timeline entries per report
│   │   ├── ReportFeedback.js     # Citizen satisfaction rating after resolution
│   │   ├── ChatMessage.js        # Saved AI chat conversations
│   │   └── Notification.js       # Per-user notifications (read/unread)
│   │
│   ├── routes/                   # Express routers (mounted under /api/*)
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── reportRoutes.js       # /api/reports
│   │   ├── adminRoutes.js        # /api/admin
│   │   ├── chatRoutes.js         # /api/chat
│   │   └── notificationRoutes.js # /api/notifications
│   │
│   ├── controllers/              # Request handlers (business logic)
│   │   ├── authController.js     # Register / login / me / profile (Zod validation + JWT)
│   │   ├── reportController.js   # CRUD, upvotes, leaderboard, feedback, AI classification
│   │   ├── adminController.js    # Stats & report status management
│   │   ├── chatController.js     # AI chat + history
│   │   └── notificationController.js
│   │
│   ├── middleware/
│   │   ├── auth.js               # JWT verification (required + optional auth)
│   │   ├── roleCheck.js          # Role-based access guard
│   │   ├── rateLimiter.js        # express-rate-limit configs (login & chat)
│   │   └── upload.js             # Multer image upload middleware
│   │
│   ├── services/
│   │   ├── aiService.js          # Gemini integration (classification + chat) + offline fallback
│   │   └── notificationService.js# Socket.IO emitter helpers
│   │
│   ├── uploads/                  # Uploaded report images (served statically at /uploads)
│   │
│   └── src/                      # ⚠️ Early scaffold (unused by the running server — kept for reference)
│       ├── app.js / server.js    # Skeleton app with commented-out /api/v1 routes
│       ├── config/               # environment.js, database.js, constants.js
│       ├── models/               # Extended schema draft (AuditLog, RefreshToken, ReportImage…)
│       ├── migrations/           # Sequelize migration files
│       ├── seeders/              # Database seeders
│       └── utils/                # AppError, catchAsync, responseHelpers
│
└── frontend/
    ├── package.json              # Frontend dependencies & scripts
    ├── vite.config.js            # Vite + React + Tailwind plugins
    ├── public/                   # Static assets
    │
    └── src/
        ├── main.jsx              # App bootstrap
        ├── App.jsx               # Router definition & page layout
        ├── i18n.js               # i18next configuration (ar/en)
        ├── index.css             # Tailwind entry + global styles
        │
        ├── components/
        │   ├── Navbar.jsx        # Top navigation (+ language switcher)
        │   ├── Footer.jsx
        │   ├── MapView.jsx       # Leaflet map (markers / location picker)
        │   ├── ReportCard.jsx    # Report preview card
        │   ├── StatusBadge.jsx   # Color-coded status badge
        │   ├── ChatWidget.jsx    # Floating AI assistant widget
        │   └── ProtectedRoute.jsx# Auth/role-aware route guard
        │
        ├── context/
        │   └── AuthContext.jsx   # Global auth state (login/logout/token/user)
        │
        ├── pages/
        │   ├── Home.jsx          # Landing page + report feed + map
        │   ├── Login.jsx         # Sign in
        │   ├── Register.jsx      # Sign up
        │   ├── CreateReport.jsx  # New report form (photo + map + AI classify)
        │   ├── ReportDetails.jsx # Full report view + timeline + upvote + feedback
        │   ├── Profile.jsx       # My reports & profile settings
        │   ├── Notifications.jsx # Notification inbox
        │   └── AdminDashboard.jsx# Stats, charts & report management
        │
        ├── services/
        │   └── api.js            # Axios instance (baseURL → http://localhost:5000/api)
        │
        └── locales/
            ├── ar.json           # Arabic translations
            └── en.json           # English translations
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- npm (comes with Node)

### 1. Clone & install

```bash
git clone <repo-url>
cd "Civic  Reporting Platform"

npm run install:all
# installs: root (concurrently) + backend deps + frontend deps
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

JWT_SECRET=<any-long-random-string>

# Optional — enables the real AI assistant (otherwise offline fallback is used)
GEMINI_API_KEY=<your-google-ai-studio-key>
GEMINI_MODEL=gemini-2.5-flash
```

> 💡 Get a free Gemini key at [Google AI Studio](https://aistudio.google.com/apikey).
> The database works out of the box with SQLite — no installation needed. For PostgreSQL, set `DATABASE_URL`.

### 3. Run

```bash
npm run start:dev
```

This starts both servers with concurrently:
- 🔧 Backend API → http://localhost:5000
- 🎨 Frontend (Vite) → http://localhost:5173

### Default admin account

Created automatically on first backend start:

```
Email:    admin@civic.com
Password: admin123
```

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Login (rate-limited) → `{ token, user }` |
| GET | `/auth/me` | 🔒 | Current user profile |
| PATCH | `/auth/profile` | 🔒 | Update name / neighborhood / phone |

### Reports
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/reports` | optional | List/filter all reports |
| GET | `/reports/:id` | optional | Single report details |
| GET | `/reports/user/my-reports` | 🔒 | My reports |
| GET | `/reports/leaderboard` | optional | Top citizens by trust score |
| POST | `/reports` | 🔒 | Create report (multipart: `image` + fields, rate-limited) |
| POST | `/reports/classify` | 🔒 | AI-classify a description → category + title |
| PATCH | `/reports/:id/upvote` | 🔒 | Toggle upvote |
| POST | `/reports/:id/feedback` | 🔒 | Submit resolution feedback |
| DELETE | `/reports/:id` | 🔒 | Delete own report |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/stats` | 👑 | Dashboard statistics |
| GET | `/admin/reports` | 👑 | Manageable report list |
| PATCH | `/admin/reports/:id/status` | 👑 | Change status + add note |

### Chat (AI)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/chat` | optional | Send message → AI reply (rate-limited) |
| GET | `/chat/history` | 🔒 | Last 50 saved messages |

### Notifications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | 🔒 | List notifications |
| GET | `/notifications/unread-count` | 🔒 | Unread badge count |
| PATCH | `/notifications/:id/read` | 🔒 | Mark one as read |
| PATCH | `/notifications/read-all` | 🔒 | Mark all as read |

### Misc
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Service health check |
| GET | `/uploads/<file>` | Static uploaded images |

🔒 = requires `Authorization: Bearer <token>` · 👑 = admin role

---

## 🗄️ Database Schema

```
User 1───* Report 1───* Upvote *───1 User
 │            │
 │            ├───* StatusUpdate (timeline, made by admin User)
 │            └───* ReportFeedback *───1 User
 │
 ├───* ChatMessage
 └───* Notification
```

- **Report statuses:** `pending → in_progress → resolved` (or `rejected`)
- **Categories:** `pothole`, `lighting`, `water_leak`, `garbage`, `other`
- **User roles:** `citizen`, `supervisor`, `admin`

---

## 🤖 AI Assistant

Two operating modes, chosen automatically:

1. **Gemini mode** — if `GEMINI_API_KEY` is set, every chat message goes through Gemini (`gemini-2.5-flash` by default, configurable via `GEMINI_MODEL`). It answers *any* question, replies in the user's language/dialect, and receives the user's report stats as context for personalized answers.
2. **Offline fallback** — without a key (or if the API fails), a built-in rule-based responder covers common platform questions (how to report, tracking, upvotes).

The same service also powers **automatic report classification**: a new report's description is turned into a category + suggested title.

---

## 📜 Available Scripts

| Location | Script | Description |
|---|---|---|
| root | `npm run start:dev` | Run backend + frontend together |
| root | `npm run start:backend` | Backend only |
| root | `npm run start:frontend` | Frontend only |
| root | `npm run install:all` | Install all workspaces |
| backend | `npm run dev` | Backend with auto-restart on change |
| backend | `npm start` | Production start |
| frontend | `npm run dev` | Vite dev server (hot reload) |
| frontend | `npm run build` | Production build |
| frontend | `npm run lint` | Lint with oxlint |

---

## 📄 License

ISC
#
