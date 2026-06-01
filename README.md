# CIT Aptitude Portal — MERN Stack Institutional Assessment System

[![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb)](https://mongodb.com)
[![Express.js](https://img.shields.io/badge/Backend-Express.js-000000?style=flat&logo=express)](https://expressjs.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?style=flat&logo=node.js)](https://nodejs.org)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A full-stack aptitude testing platform for institutional use. Administrators manage a question bank, assemble timed tests, review analytics, export scores, and inspect proctoring logs. Students register, take proctored assessments with server-enforced timers, view results, review answers, and download PDF reports. Built with the MERN stack, Chakra UI, and JWT sessions stored in HTTP-only cookies.

---

## Key Features

### Student

- **Authentication** — Register and sign in with JWT stored in an HTTP-only cookie (`withCredentials` on the client).
- **Dashboard** — Lists available tests, submission history, and a simple performance trend chart.
- **Proctored tests** — Fullscreen on start; tab-switch and fullscreen-exit events are logged; the **3rd violation** auto-submits the attempt.
- **Server timer** — Attempt expiry is enforced on the server; the client syncs from `expiresAt` and auto-submits when time runs out.
- **One submission per test** — Enforced by a unique index on `(user, test)` and attempt lifecycle checks.
- **Results & review** — Score summary plus question-by-question review with correct answers and explanations.
- **PDF report** — Download a per-submission report via PDFKit on the backend.

### Admin

- **Question bank** — Paginated CRUD with category filter (max 50 questions per page on the API).
- **Tests** — Create, update, delete tests; attach questions from the bank; view test detail.
- **Analytics** — Score distribution buckets, per-test averages, monthly trends, category accuracy.
- **Proctoring logs** — Violations per test (`tab_switch`, `fullscreen_exit`).
- **CSV export** — Download all scores for a test.

> **Note:** There is no dedicated “user management” UI or API. Student accounts self-register; promote admins by setting `isAdmin: true` on a user document in MongoDB.

### Security & integrity

- JWT in HTTP-only cookies (`sameSite: strict`, `secure` in production).
- `express-validator` on inputs; structured `400` responses via `validateRequest` middleware.
- Login rate limit: **50 requests / 15 minutes** per IP on `POST /api/auth/login`.
- `helmet`, `cors` (configurable origins), `morgan` logging.
- Questions shuffled per attempt; `correctAnswer` is never sent to the client during a test.
- Scoring and deadline checks run on the server (`SUBMIT_GRACE_MS` = **30 seconds** after `expiresAt`).

---

## Project structure

```
aptitude-app-cit/
├── .env.example          # Template for server + client env vars
├── .gitignore
├── README.md
├── client/               # React 18 + Vite frontend
│   ├── index.html
│   ├── package.json
│   ├── public/
│   │   └── manifest.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx              # Chakra theme, axios base URL, ToastContainer
│       ├── App.jsx               # Routes + auth guards (inline, no separate ProtectedRoute)
│       ├── api/
│       │   ├── authService.js
│       │   ├── testService.js
│       │   ├── adminService.js
│       │   └── submissionService.js
│       ├── components/
│       │   ├── Layout.jsx        # Nav bar + outlet (replaces a separate Navbar)
│       │   └── LoadingSpinner.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       └── pages/
│           ├── LandingPage.jsx
│           ├── Login.jsx
│           ├── Register.jsx      # Password strength UI + confirm password
│           ├── Dashboard.jsx
│           ├── Profile.jsx
│           ├── Test.jsx          # Proctoring + timer
│           ├── Results.jsx
│           ├── ReviewPage.jsx
│           └── admin/
│               ├── AdminTestsList.jsx    # Default /admin — test list + create modal
│               ├── AdminTestDetail.jsx   # Edit test + assign questions
│               ├── AdminQuestionsList.jsx
│               └── AdminAnalytics.jsx
│               # Unused (not routed): AdminDashboard.jsx, ManageTests.jsx
└── server/               # Express API
    ├── index.js          # App entry, MongoDB connect, middleware, route mounting
    ├── package.json
    ├── config/
    │   └── constants.js  # SUBMIT_GRACE_MS
    ├── controllers/
    │   ├── authController.js
    │   ├── adminController.js
    │   ├── testController.js
    │   └── submissionController.js
    ├── middleware/
    │   ├── authMiddleware.js   # protect, admin
    │   └── validateRequest.js
    ├── models/
    │   ├── User.js
    │   ├── Question.js
    │   ├── Test.js
    │   ├── Attempt.js
    │   ├── Submission.js
    │   └── Violation.js
    ├── routes/
    │   ├── auth.js
    │   ├── adminRoutes.js
    │   ├── testRoutes.js
    │   └── submissionRoutes.js
    ├── validators/
    │   ├── authValidators.js
    │   ├── adminValidators.js
    │   ├── testValidators.js
    │   └── submissionValidators.js
    └── tests/
        ├── setup.js              # In-memory MongoDB for Jest
        └── integration.test.js
```

---

## Tech stack

| Layer | Technology |
|--------|------------|
| **Frontend** | React 18, Vite 5, Chakra UI 2, Framer Motion, Lucide React, Recharts, React Router 6, Axios, React Hook Form, React Toastify |
| **Backend** | Node.js, Express 4, Mongoose 8 |
| **Database** | MongoDB |
| **Auth** | `jsonwebtoken`, `bcryptjs`, cookie-based sessions |
| **Reports / export** | PDFKit, json2csv |
| **Security** | Helmet, CORS, express-rate-limit, express-validator |
| **Testing** | Jest, Supertest, mongodb-memory-server |

---

## Frontend routes

| Path | Access | Page |
|------|--------|------|
| `/` | Public (redirects if logged in) | Landing |
| `/login`, `/register` | Public | Auth |
| `/dashboard` | Student | Dashboard |
| `/profile` | Student | Profile |
| `/test/:testId` | Student | Proctored test UI |
| `/results/:submissionId` | Student | Results |
| `/review/:submissionId` | Student | Answer review |
| `/admin` | Admin | Test list |
| `/admin/analytics` | Admin | Analytics |
| `/admin/tests/:testId` | Admin | Test detail / question assignment |
| `/admin/questions` | Admin | Question bank |

Route protection is implemented in `App.jsx` using `AuthContext` and nested `<Layout />` routes.

---

## API reference

Base URL: `http://localhost:5000` (or `VITE_API_URL` on the client). All protected routes expect the `token` HTTP-only cookie set at login/register.

### Auth — `/api/auth`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | Public | Register (`name`, `email`, `password` min 8 chars) |
| POST | `/login` | Public | Login (rate-limited) |
| POST | `/logout` | Public | Clear session cookie |
| GET | `/me` | User | Current user (`_id`, `name`, `email`, `isAdmin`) |

### Tests — `/api/tests`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | User | List tests (`title`, `duration`) |
| GET | `/:id/start` | User | Start or resume attempt; returns questions (no correct answers), `attemptId`, `expiresAt`, `serverTime` |
| POST | `/:id/submit` | User | Body: `{ attemptId, answers: { [questionId]: option } }` |
| POST | `/:id/violations` | User | Body: `{ attemptId, type: 'tab_switch' \| 'fullscreen_exit' }` |

### Submissions — `/api/submissions`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/my-history` | User | All submissions for the current user |
| GET | `/:id/review` | User | Full review payload (own submission only) |
| GET | `/:id/report` | User | PDF download (own submission only) |

### Admin — `/api/admin`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/questions` | Admin | Paginated list (`page`, `limit` ≤ 50, `category`) |
| POST | `/questions` | Admin | Create question |
| PUT | `/questions/:id` | Admin | Update question |
| DELETE | `/questions/:id` | Admin | Delete question (removed from all tests) |
| POST | `/tests` | Admin | Create test (`title`, `duration`, `questionIds[]` min 1) |
| GET | `/tests/:id` | Admin | Test with populated questions |
| PUT | `/tests/:id` | Admin | Update test |
| DELETE | `/tests/:id` | Admin | Delete test |
| GET | `/analytics` | Admin | Dashboard metrics |
| GET | `/tests/:testId/violations` | Admin | Violation log for a test |
| GET | `/tests/:id/export` | Admin | CSV attachment of scores |

### Health

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | `Aptitude App API is running...` |

---

## Database models

### User

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Required, unique, trimmed |
| `password` | String | Required, bcrypt-hashed on save |
| `isAdmin` | Boolean | Default `false` |
| `createdAt`, `updatedAt` | Date | Timestamps |

### Question

| Field | Type | Notes |
|-------|------|-------|
| `text` | String | Required |
| `options` | String[] | Required |
| `correctAnswer` | String | Required |
| `explanation` | String | Default: `"No explanation provided."` |
| `category` | String | Required, trimmed |
| `createdBy`, `updatedBy` | ObjectId → User | Optional audit |

### Test

| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Required, unique |
| `duration` | Number | Minutes |
| `questions` | ObjectId[] → Question | |
| `updatedBy` | ObjectId → User | Optional |

### Attempt

| Field | Type | Notes |
|-------|------|-------|
| `user`, `test` | ObjectId | Required |
| `startedAt`, `expiresAt` | Date | Required |
| `questions` | ObjectId[] | Shuffled order for this attempt |
| `status` | String | `active` \| `submitted` \| `expired` |

### Submission

| Field | Type | Notes |
|-------|------|-------|
| `user`, `test` | ObjectId | Unique together |
| `attempt` | ObjectId | Optional ref |
| `score`, `total` | Number | Required |
| `answers` | Map\<questionId, selectedOption\> | Required |

### Violation

| Field | Type | Notes |
|-------|------|-------|
| `user`, `test`, `attempt` | ObjectId | Required |
| `type` | String | `tab_switch` \| `fullscreen_exit` |
| `timestamp` | Date | Default now |

---

## Getting started

### Prerequisites

- **Node.js** 18+ recommended (16+ minimum)
- **MongoDB** (local or Atlas)
- **npm**

### 1. Clone

```bash
git clone https://github.com/your-org/aptitude-app-cit.git
cd aptitude-app-cit
```

### 2. Environment variables

Copy the root template and configure both apps:

```bash
cp .env.example server/.env
```

**`server/.env`** (required when running the API from `server/`):

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | API port | `5000` |
| `NODE_ENV` | `development` or `production` | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/aptitude-app` |
| `JWT_SECRET` | Signing secret (use a long random value in production) | *(change default)* |
| `CLIENT_ORIGIN` | Allowed CORS origin(s), comma-separated | `http://localhost:5173` |

**`client/.env.local`** (optional; defaults to `http://localhost:5000`):

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL for Axios |

The client sends cookies cross-origin via `axios.defaults.withCredentials = true`, so `CLIENT_ORIGIN` must match the Vite dev URL (default `http://localhost:5173`).

### 3. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Run locally (development)

Terminal 1 — API (from `server/`):

```bash
npm start
```

Terminal 2 — frontend (from `client/`):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` to the backend, so you do not need `VITE_API_URL` unless the API runs on another host.

### 4b. Run for production (single server)

```bash
cd client && npm run build
cd ../server
# Ensure server/.env has NODE_ENV=production and JWT_SECRET (32+ chars)
npm run start:prod
```

Open [http://localhost:5000](http://localhost:5000). Express serves `client/dist` and the API on the same origin. Health check: `GET /api/health`.

### 5. Create an admin user

New registrations always get `isAdmin: false`. After registering once, promote a user in MongoDB:

```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { isAdmin: true } })
```

### 6. Production build (client)

```bash
cd client
npm run build    # output: client/dist/
npm run preview  # local preview of production build
```

Serve `client/dist` with any static host and point `VITE_API_URL` at your deployed API. Set `NODE_ENV=production` on the server so cookies use `secure: true`.

---

## Running tests

From `server/`:

```bash
npm test
```

Uses Jest + Supertest with an in-memory MongoDB (`tests/setup.js`). Coverage is written to `server/coverage/`.

---

## How proctoring works

1. **Start** — `GET /api/tests/:id/start` creates or resumes an `Attempt` with a server-side `expiresAt`.
2. **Fullscreen** — The test container requests fullscreen when the attempt loads.
3. **Listeners** (client):
   - `visibilitychange` → logs `tab_switch` when the document is hidden.
   - `fullscreenchange` → logs `fullscreen_exit` when fullscreen ends.
4. **Server log** — Each event is stored in `Violation` via `POST /api/tests/:id/violations`.
5. **Auto-submit** — On the **3rd** violation, the client submits immediately. The timer also auto-submits when `expiresAt` is reached.

---

## Scoring & attempt rules

- Answers are scored on the server by comparing submitted options to each question’s `correctAnswer`.
- Only question IDs from the active attempt are accepted in the submit body.
- Submit is rejected after `expiresAt + SUBMIT_GRACE_MS` (30 seconds).
- Duplicate submits return `409` (unique submission per user/test).
- Starting a test after submit returns `409`.
- Active attempts can be **resumed** until expiry if the user refreshes or returns before time runs out.

---

## Client ↔ server integration

- `client/src/main.jsx` sets `axios.defaults.baseURL` from `VITE_API_URL` and enables credentials.
- API modules use relative paths (`/api/...`), so the base URL must be the server origin, not the Vite dev server path alone.
- Validation errors from the API return `{ message, errors: [{ path, msg, value }] }`; the register page surfaces `errors[0].msg` when present.

---

## Screenshots

*(Replace placeholders with real screenshots after deployment.)*

| Login | Student dashboard |
|-------|-------------------|
| ![Login](https://via.placeholder.com/400x250?text=Login) | ![Dashboard](https://via.placeholder.com/400x250?text=Dashboard) |

| Test UI | Admin analytics |
|---------|-----------------|
| ![Test](https://via.placeholder.com/400x250?text=Test+UI) | ![Analytics](https://via.placeholder.com/400x250?text=Analytics) |

---

## Future improvements

- [ ] Email notifications for results
- [ ] Bulk question import (CSV/Excel)
- [ ] Admin UI for user/role management
- [ ] Webcam-based proctoring
- [ ] Live “who is taking a test now” monitor
- [ ] Category leaderboards
- [ ] Remove or wire up unused admin pages (`AdminDashboard.jsx`, `ManageTests.jsx`)

---

## License

Distributed under the **ISC License** (see `server/package.json`). No separate `LICENSE` file is included in the repository.

---

*Built for CIT students.*
