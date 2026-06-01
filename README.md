# CIT Aptitude Portal — MERN Stack Institutional Assessment System

[![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb)](https://mongodb.com)
[![Express.js](https://img.shields.io/badge/Backend-Express.js-000000?style=flat&logo=express)](https://expressjs.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?style=flat&logo=node.js)](https://nodejs.org)

A full-stack aptitude testing platform for institutional use. **Students** register, take proctored timed tests, and review results. **Administrators** manage the question bank, publish tests, view analytics, inspect test-wise submissions, export CSVs, and promote other users to admin.

Built with the MERN stack, Chakra UI, JWT sessions in HTTP-only cookies, and role-based access on both frontend and backend.

---

## Key features

### Student

| Feature | Description |
|---------|-------------|
| **Registration** | Split-screen signup with validation, password strength meter, and proctoring terms checkbox |
| **Login** | Professional sign-in with inline validation and show/hide password |
| **Dashboard** | Available tests, stats, score history chart |
| **Proctored tests** | Fullscreen; tab/fullscreen violations logged; 3rd violation auto-submits |
| **Server timer** | `expiresAt` enforced on the server; client syncs and auto-submits |
| **One submission per test** | Unique index on `(user, test)` |
| **Results & review** | Score summary, per-question review with explanations |
| **PDF report** | Download via PDFKit (`GET /api/submissions/:id/report`) |

### Super admin & administrators

| Feature | Description |
|---------|-------------|
| **Admin console** | Dedicated sidebar layout; dashboard is the default `/admin` home |
| **Question bank** | Paginated CRUD with category filter |
| **Tests** | Create, edit, delete; assign questions; quick create or full wizard |
| **Analytics** | Score buckets, monthly trends, per-test averages, category accuracy |
| **Test-wise results** | Per-test submission table, summary stats, CSV export |
| **Users & roles** | List all users, all submissions, toggle `isAdmin` for any account |
| **Proctoring logs** | Violations per test on test detail |
| **CSV export** | All scores for a test |

### Security & integrity

- JWT in HTTP-only cookies (`sameSite: strict`, `secure` in production)
- `express-validator` on inputs; students cannot self-register as admin
- Login rate limit: **50 requests / 15 minutes** per IP
- Primary super admin cannot be demoted via API
- Questions shuffled per attempt; `correctAnswer` never sent during a test
- Server-side scoring and deadline checks (`SUBMIT_GRACE_MS` = 30 seconds)

---

## Default super admin credentials

After a database reset (see below), sign in with:

| Field | Value |
|-------|--------|
| **Name** | Admin |
| **Email** | `admin@aptitude.com` |
| **Password** | `Admin@123` |

Override via `server/.env`:

```env
SUPER_ADMIN_EMAIL=admin@aptitude.com
SUPER_ADMIN_PASSWORD=Admin@123
SUPER_ADMIN_NAME=Admin
```

On server start, the super admin is created if missing. In **development**, the password is kept in sync with env defaults. Use `npm run reset:db` for a **clean database** (deletes all users, tests, questions, submissions, attempts, and violations, then creates only the super admin).

---

## Project structure

```
aptitude-app-cit/
├── .env.example
├── README.md
├── client/
│   └── src/
│       ├── main.jsx
│       ├── theme.js
│       ├── App.jsx
│       ├── api/
│       ├── components/
│       │   ├── AuthLayout.jsx      # Login / register split layout
│       │   ├── AdminLayout.jsx     # Admin sidebar console
│       │   └── Layout.jsx          # Student nav
│       ├── context/AuthContext.jsx
│       └── pages/
│           ├── Login.jsx, Register.jsx, LandingPage.jsx
│           ├── Dashboard.jsx, Test.jsx, Results.jsx, …
│           └── admin/
│               ├── AdminDashboard.jsx   # Default /admin
│               ├── AdminAnalytics.jsx
│               ├── AdminTestResults.jsx   # Test-wise results
│               ├── AdminUsers.jsx
│               ├── AdminTestsList.jsx, AdminTestDetail.jsx
│               ├── AdminQuestionsList.jsx, ManageTests.jsx
└── server/
    ├── index.js
    ├── config/superAdmin.js
    ├── scripts/
    │   ├── resetDatabase.js      # Wipe DB + create super admin
    │   ├── ensureSuperAdmin.js
    │   └── seedSuperAdmin.js
    ├── controllers/, models/, routes/, validators/, tests/
```

---

## Frontend routes

| Path | Access | Page |
|------|--------|------|
| `/` | Public | Landing (redirects: admin → `/admin`, student → `/dashboard`) |
| `/login`, `/register` | Public | Auth (split layout) |
| `/dashboard` | Student | Dashboard |
| `/profile` | Student | Test history |
| `/test/:testId` | Student | Proctored test |
| `/results/:submissionId` | Student | Results |
| `/review/:submissionId` | Student | Answer review |
| `/admin` | Admin | **Dashboard (default admin home)** |
| `/admin/analytics` | Admin | Analytics |
| `/admin/results` | Admin | Pick a test for results |
| `/admin/results/:testId` | Admin | Test-wise submissions |
| `/admin/tests` | Admin | Test list |
| `/admin/tests/create` | Admin | Create test with questions |
| `/admin/tests/:testId` | Admin | Test detail |
| `/admin/questions` | Admin | Question bank |
| `/admin/users` | Admin | Users, roles, all submissions |

Admins are redirected to `/admin` after login. Students use the top navigation layout; admins use the **Admin Console** sidebar.

---

## API reference

Base URL: `http://localhost:5000` (dev) or same origin in production. Protected routes use the `token` HTTP-only cookie.

### Auth — `/api/auth`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | Public | Register student (`isAdmin` always `false`) |
| POST | `/login` | Public | Login (rate-limited) |
| POST | `/logout` | Public | Clear cookie |
| GET | `/me` | User | Current user |

### Tests — `/api/tests`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | User | List tests |
| GET | `/:id/start` | User | Start/resume attempt |
| POST | `/:id/submit` | User | Submit answers |
| POST | `/:id/violations` | User | Log proctoring event |

### Submissions — `/api/submissions`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/my-history` | User | Own submissions |
| GET | `/:id/review` | User | Review (own only) |
| GET | `/:id/report` | User | PDF (own only) |

### Admin — `/api/admin`

All routes require `protect` + `admin` middleware.

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/users` | All users (no passwords) |
| PATCH | `/users/:id/admin` | Body: `{ isAdmin: boolean }` — grant/revoke admin |
| GET | `/submissions` | All submissions (populated) |
| GET | `/questions` | Paginated question bank |
| POST | `/questions` | Create question |
| PUT | `/questions/:id` | Update question |
| DELETE | `/questions/:id` | Delete question |
| POST | `/tests` | Create test |
| GET | `/tests/:id` | Test + questions |
| PUT | `/tests/:id` | Update test |
| DELETE | `/tests/:id` | Delete test |
| GET | `/tests/:id/results` | **Test-wise JSON results** + summary |
| GET | `/tests/:id/export` | CSV scores |
| GET | `/tests/:testId/violations` | Violation log |
| GET | `/analytics` | Dashboard metrics |

### Health

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | API + DB status |

---

## Database models

### User

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Required, unique |
| `password` | String | bcrypt-hashed |
| `isAdmin` | Boolean | Default `false`; only admins can change others |

### Question, Test, Attempt, Submission, Violation

See earlier sections in this repo’s history or `server/models/` for full schemas.

---

## Getting started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm

### 1. Clone and install

```bash
git clone https://github.com/your-org/aptitude-app-cit.git
cd aptitude-app-cit
cd server && npm install
cd ../client && npm install
```

### 2. Environment

```bash
cp .env.example server/.env
```

Edit `server/.env`:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random secret (32+ chars in production) |
| `CLIENT_ORIGIN` | `http://localhost:5173` for Vite dev |
| `SUPER_ADMIN_*` | Optional; defaults to `admin@aptitude.com` / `Admin@123` |

### 3. Reset database (recommended for first run)

**Warning:** Deletes all application data.

```bash
cd server
npm run reset:db
```

### 4. Run locally

Terminal 1 — API:

```bash
cd server
npm start
```

Terminal 2 — UI:

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), sign in as **admin@aptitude.com** / **Admin@123**.

<<<<<<< HEAD
### 5. Production (single host)

```bash
cd client && npm run build
cd ../server
# NODE_ENV=production in server/.env
npm run start:prod
```

Open [http://localhost:5000](http://localhost:5000). Health: `GET /api/health`.

---

## NPM scripts
=======
##  How Proctoring Works
>>>>>>> 9817d1e6f885ea08fed6ba2578c373114c6e40f0

| Location | Script | Description |
|----------|--------|-------------|
| `server/` | `npm start` | API (dev) |
| `server/` | `npm run start:prod` | API + static client |
| `server/` | `npm test` | Jest integration tests |
| `server/` | `npm run reset:db` | Wipe DB + create super admin |
| `server/` | `npm run seed:admin` | Upsert super admin + sync password |
| `client/` | `npm run dev` | Vite dev server |
| `client/` | `npm run build` | Production build → `client/dist` |

---

## Promoting other admins

1. Sign in as super admin.
2. Go to **Admin Console → Users**.
3. Toggle **Admin access** for a registered student.

The super admin account (`admin@aptitude.com`) cannot be demoted.

---

## How proctoring works

1. `GET /api/tests/:id/start` creates/resumes an attempt with server `expiresAt`.
2. Client requests fullscreen.
3. Tab switch / fullscreen exit → `POST .../violations`.
4. **3rd violation** → auto-submit.
5. Timer expiry → auto-submit.

---

<<<<<<< HEAD
## Running tests

```bash
cd server
npm test
```

Uses in-memory MongoDB (`tests/setup.js`).

---

## Role-based access summary

| Action | Student | Admin |
|--------|---------|-------|
| Register / login | Yes | Yes |
| Take tests | Yes | Yes (student view via nav) |
| Admin API | No | Yes |
| Admin UI routes | Redirect to dashboard | Yes |
| Promote users | No | Yes |
| Demote super admin | No | Blocked |

---

## License

**ISC License** (see `server/package.json`).

---

*Built for CIT students.*
=======
*Built with ❤️ for CIT students.*
>>>>>>> 9817d1e6f885ea08fed6ba2578c373114c6e40f0
