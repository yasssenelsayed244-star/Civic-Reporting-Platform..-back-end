# 🏙️ Civic Reporting Platform — Backend

The **backend API server** for the Civic Reporting Platform. Built with Node.js and Express, it provides a RESTful API for managing citizen infrastructure reports, real-time notifications, AI-powered classification, and an admin dashboard.

![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green) ![Database](https://img.shields.io/badge/DB-SQLite%20%2F%20PostgreSQL-orange) ![ORM](https://img.shields.io/badge/ORM-Sequelize-blue) ![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20bcrypt-red) ![Realtime](https://img.shields.io/badge/Realtime-Socket.IO-black) ![AI](https://img.shields.io/badge/AI-Google%20Gemini-yellow)

---

## 📑 Table of Contents

- [Tech Stack](#️-tech-stack)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#️-database-schema)
- [AI Assistant](#-ai-assistant)
- [Available Scripts](#-available-scripts)

---

## 🛠️ Tech Stack

| Category | Package | Version | Description |
|---|---|---|---|
| **Runtime** | Node.js (`node --watch`) | ≥ 18.0.0 | JavaScript runtime with built-in auto-restart for development |
| **Web Framework** | Express.js (`express`) | `^4.21.0` | RESTful API framework for routing, middleware, and request handling |
| **Dev Database** | SQLite 3 (`sqlite3`) | `^6.0.1` | Zero-config local file database (`database.sqlite`) for development |
| **Prod Database** | PostgreSQL (`pg`, `pg-hstore`) | `^8.13.0` | Production-grade relational database, auto-enabled via `DATABASE_URL` |
| **ORM** | Sequelize (`sequelize`) | `^6.37.3` | Object-Relational Mapping for models, associations, hooks, and queries |
| **DB Migrations & Seeds** | Sequelize CLI (`sequelize-cli`) | `^6.6.2` | Schema migrations, seed data, and database reset tooling |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | `^9.0.2` | Token-based stateless authentication for protected API endpoints |
| **Password Hashing** | bcryptjs (`bcryptjs`) | `^2.4.3` | Automatic password hashing via Sequelize `beforeCreate`/`beforeUpdate` hooks |
| **Authorization (RBAC)** | Custom Middleware (`roleCheck.js`) | — | Role-based access control guard (`citizen` / `supervisor` / `admin`) |
| **AI Engine** | Google Gemini API (`@google/generative-ai`) | `^0.24.1` | Auto-classification of reports, title generation, and AI chatbot (`gemini-2.5-flash`) |
| **Real-Time** | Socket.IO Server (`socket.io`) | `^4.7.5` | WebSocket-based real-time notifications via per-user rooms (`user:${id}`) |
| **Data Validation** | Zod (`zod`) | `^3.23.8` | Strict schema validation for all incoming request payloads |
| **File Uploads** | Multer (`multer`) | `^1.4.5-lts.1` | Multipart/form-data image upload handler with local `/uploads` storage |
| **Unique IDs** | UUID (`uuid`) | `^10.0.0` | UUID v4 generation for primary keys and uploaded file names |
| **Security Headers** | Helmet (`helmet`) | `^8.0.0` | HTTP security headers to protect against common web vulnerabilities |
| **CORS** | CORS (`cors`) | `^2.8.5` | Cross-Origin Resource Sharing policy configuration |
| **Rate Limiting** | Express Rate Limit (`express-rate-limit`) | `^7.4.0` | Request throttling on auth, chat, and report creation endpoints |
| **Environment Config** | Dotenv (`dotenv`) | `^16.4.5` | Loads secrets and configuration from the `.env` file |

#### 📦 `package.json` Dependencies:

```json
{
  "dependencies": {
    "express": "^4.21.0",
    "sequelize": "^6.37.3",
    "sqlite3": "^6.0.1",
    "pg": "^8.13.0",
    "pg-hstore": "^2.3.4",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "@google/generative-ai": "^0.24.1",
    "socket.io": "^4.7.5",
    "zod": "^3.23.8",
    "multer": "^1.4.5-lts.1",
    "helmet": "^8.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.4.0",
    "dotenv": "^16.4.5",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "sequelize-cli": "^6.6.2"
  }
}
```

---

## 📁 Folder Structure

```
backend/
│
├── server.js                   # ★ Main entry point — Express app + Socket.IO +
│                               #   route registration + DB sync + admin seeding
├── package.json                # Dependencies & scripts
├── .sequelizerc                # Sequelize CLI config path
├── .env                        # Environment variables (secrets — NOT committed)
├── .env.example                # Template for required environment variables
├── .gitignore
├── database.sqlite             # Dev database file (auto-created)
├── uploads/                    # Uploaded report images (served at /uploads)
│
├── config/
│   └── db.js                   # Sequelize instance (SQLite dev / Postgres prod)
│
├── models/                     # Sequelize models + associations
│   ├── index.js                # Model registry & relationships
│   ├── User.js                 # Users (citizen/supervisor/admin, trust score)
│   ├── Report.js               # Civic issue reports (location, photo, category, status)
│   ├── Upvote.js               # User ⇄ report upvotes (join model)
│   ├── StatusUpdate.js         # Status-change timeline entries per report
│   ├── ReportFeedback.js       # Citizen satisfaction rating after resolution
│   ├── ChatMessage.js          # Saved AI chat conversations
│   └── Notification.js         # Per-user notifications (read/unread)
│
├── routes/                     # Express routers (mounted under /api/*)
│   ├── authRoutes.js           # /api/auth
│   ├── reportRoutes.js         # /api/reports
│   ├── adminRoutes.js          # /api/admin
│   ├── chatRoutes.js           # /api/chat
│   └── notificationRoutes.js   # /api/notifications
│
├── controllers/                # Request handlers (business logic)
│   ├── authController.js       # Register / login / me / profile (Zod + JWT)
│   ├── reportController.js     # CRUD, upvotes, leaderboard, feedback, AI classify
│   ├── adminController.js      # Dashboard stats & report status management
│   ├── chatController.js       # AI chat + history
│   └── notificationController.js  # List / unread count / mark as read
│
├── middleware/                 # Express middlewares
│   ├── auth.js                 # JWT verification (required + optional auth)
│   ├── roleCheck.js            # Role-based access guard
│   ├── rateLimiter.js          # express-rate-limit configs (login & chat)
│   └── upload.js               # Multer image upload handler
│
├── services/                   # Business services
│   ├── aiService.js            # Gemini integration (classify + chat) +
│   │                           #   keyword-matching offline fallback + duplicate detection
│   └── notificationService.js  # Socket.IO emitter helpers
│
└── src/                        # ⚠️ Early scaffold (unused by the running server)
    ├── app.js                  # Skeleton Express app (/api/v1 style)
    ├── server.js               # Skeleton server entry
    │
    ├── config/
    │   ├── constants.js        # App-wide constants
    │   ├── database.js         # Sequelize CLI config
    │   └── environment.js      # Env variable loader
    │
    ├── models/                 # Extended schema draft
    │   ├── index.js
    │   ├── AuditLog.js         # Action audit trail
    │   ├── Category.js         # Report categories table
    │   ├── Notification.js
    │   ├── RefreshToken.js     # JWT refresh token store
    │   ├── Report.js
    │   ├── ReportImage.js      # Multiple images per report
    │   ├── ReportStatusHistory.js
    │   ├── ResolutionFeedback.js
    │   └── User.js
    │
    ├── migrations/
    │   └── 20240101000001-initial-schema.js   # Initial DB migration
    │
    ├── seeders/
    │   └── 20240101000001-initial-data.js     # Initial seed data
    │
    ├── utils/
    │   ├── AppError.js         # Custom error class
    │   ├── catchAsync.js       # Async wrapper helper
    │   └── responseHelpers.js  # Standardized API response helpers
    │
    ├── controllers/            # (empty scaffold — .gitkeep)
    ├── integrations/           # (empty scaffold — .gitkeep)
    ├── middlewares/            # (empty scaffold — .gitkeep)
    ├── repositories/           # (empty scaffold — .gitkeep)
    ├── routes/                 # (empty scaffold — .gitkeep)
    ├── services/               # (empty scaffold — .gitkeep)
    └── validators/             # (empty scaffold — .gitkeep)
```

> 💡 The active backend runs from `backend/server.js` using the top-level `config/ models/ routes/ controllers/ middleware/ services/` folders. The `src/` folder is an early architectural scaffold kept for reference (it powers the Sequelize CLI migrations/seeds via `.sequelizerc`).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- npm (comes with Node)

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Then edit `.env`:

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
npm run dev
```

The backend API will be running at → http://localhost:5000

### 🔑 Default admin account

Created automatically on first start:

```
Email:    admin@civic.com
Password: admin123
```

---

## 🔧 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Backend port (default `5000`) |
| `NODE_ENV` | No | `development` / `production` |
| `FRONTEND_URL` | No | Allowed CORS origin (default `http://localhost:5173`) |
| `DATABASE_URL` | No | PostgreSQL connection string (SQLite used if empty) |
| `JWT_SECRET` | Yes* | Token signing secret (*falls back to default in dev*) |
| `GEMINI_API_KEY` | No | Enables real AI chat/classification (offline fallback if empty) |
| `GEMINI_MODEL` | No | Gemini model name (default `gemini-2.5-flash`) |

Full list with production options (Cloudinary, Anthropic, JWT refresh tokens) in [`.env.example`](.env.example).

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

🔒 = requires `Authorization: Bearer <token>` · 👑 = admin role · *optional = works with or without token*

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

1. **Gemini mode** — if `GEMINI_API_KEY` is set, every chat message goes through Gemini (`gemini-2.5-flash` by default). It answers *any* question, replies in the user's language/dialect, and receives the user's report stats as context for personalized answers.
2. **Offline fallback** — without a key (or if the API fails), a built-in rule-based responder covers common platform questions.

The same service also powers:
- **Automatic report classification**: description → category + suggested title (JSON output)
- **Duplicate detection**: bounding-box search for similar open reports nearby (~0.5 km radius)

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with auto-restart (`node --watch`) |
| `npm start` | Production start |
| `npm run migrate` | Run Sequelize migrations |
| `npm run migrate:undo` | Undo last migration |
| `npm run seed` | Run database seeders |
| `npm run db:reset` | Undo all migrations → migrate → seed |

---

## 📄 License

ISC
