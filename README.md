# CIT Aptitude Portal — MERN Stack Institutional Assessment System

[![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb)](https://mongodb.com)
[![Express.js](https://img.shields.io/badge/Backend-Express.js-000000?style=flat&logo=express)](https://expressjs.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?style=flat&logo=node.js)](https://nodejs.org)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A comprehensive, professional-grade aptitude testing platform designed for institutional use. This portal enables administrators to manage a vast repository of questions, create timed tests, and analyze student performance through a data-rich dashboard. For students, it provides a seamless, proctored environment to take assessments, track their progress, and review detailed results. Built with the MERN stack and styled with Chakra UI, the system prioritizes security, scalability, and a premium user experience.

---

##  Key Features

###  Student Features
- **Secure Authentication**: Registration and login restricted to institutional emails (`@cit.edu.in`).
- **Personal Dashboard**: View available tests, track attempt history, and see overall performance.
- **Proctored Testing**: Anti-cheating environment with fullscreen enforcement and tab-switch detection.
- **Instant Results**: Detailed score breakdown immediately after submission.
- **Review System**: Step-by-step review of questions with correct answers and explanations.
- **PDF Reports**: Downloadable performance reports for career counseling.

###  Admin Features
- **Question Bank Management**: CRUD operations for questions with categorization (Aptitude, Logical, Verbal, etc.).
- **Test Orchestration**: Create timed tests by selecting specific questions from the bank.
- **Analytics Dashboard**: High-level overview of student performance, score distributions, and category-wise accuracy.
- **Proctoring Logs**: Detailed list of violations (tab switches, fullscreen exits) per student attempt.
- **Data Export**: Export test results to CSV for external record-keeping.
- **User Management**: Overview of registered students and their activity.

###  Technical & Security Features
- **JWT Authentication**: Secure stateless session management via HTTP-only cookies.
- **Request Validation**: Robust input sanitization and validation using `express-validator`.
- **Rate Limiting**: Protection against brute-force attacks on sensitive routes.
- **Security Headers**: Implementation of `helmet` and `CORS` best practices.
- **Randomized Attempts**: Question shuffling for every student attempt to prevent answer sharing.
- **Attempt Integrity**: Server-side countdown enforcement with a submission grace period.

---

##  Project Structure

### Root Directory
- `.env.example` — Template for server and client environment variables.
- `.gitignore` — Standard git ignore file for node_modules and env files.
- `package.json` — Root package file (if used for workspace management).
- `README.md` — Project documentation and setup guide.

### Backend (`server/`)
- `index.js` — Main entry point, middleware setup, and database connection.
- `config/`
  - `constants.js` — Global constants like grace periods and pagination limits.
  - `db.js` — MongoDB connection logic using Mongoose.
- `controllers/`
  - `adminController.js` — Logic for question/test CRUD and data analytics.
  - `authController.js` — Logic for registration, login, and user sessions.
  - `submissionController.js` — Logic for fetching results and generating PDF reports.
  - `testController.js` — Logic for starting tests, shuffling questions, and scoring.
- `middleware/`
  - `authMiddleware.js` — JWT verification and admin role protection.
  - `errorMiddleware.js` — Centralized error handling and formatting.
  - `validateRequest.js` — Middleware to catch and report express-validator errors.
- `models/`
  - `Attempt.js` — Tracks the state and lifecycle of a student's test session.
  - `Question.js` — Schema for individual test questions and categories.
  - `Submission.js` — Records the final results, scores, and answers for a test.
  - `Test.js` — Defines test parameters, durations, and question sets.
  - `User.js` — Schema for students and admins with password hashing.
  - `Violation.js` — Logs proctoring events like tab switching.
- `routes/`
  - `adminRoutes.js` — API endpoints for administrative management.
  - `auth.js` — API endpoints for user authentication.
  - `submissionRoutes.js` — API endpoints for viewing and downloading results.
  - `testRoutes.js` — API endpoints for student test interactions.
- `validators/`
  - `adminValidators.js` — Validation rules for test and question management.
  - `authValidators.js` — Validation rules for login and registration.
  - `testValidators.js` — Validation rules for test submissions and violations.

### Frontend (`client/`)
- `src/App.jsx` — Central routing configuration and layout wrapping.
- `src/main.jsx` — Application entry point with Chakra UI and Auth providers.
- `src/api/`
  - `adminService.js` — API calls for admin management and analytics.
  - `authService.js` — API calls for authentication and user profile.
  - `testService.js` — API calls for test taking and submission.
- `src/components/`
  - `Layout.jsx` — Main layout wrapper with navigation and footer.
  - `Navbar.jsx` — Responsive navigation bar with role-based links.
  - `ProtectedRoute.jsx` — Route guard for authenticated and admin access.
  - `LoadingSpinner.jsx` — Global loading indicator for async operations.
- `src/context/`
  - `AuthContext.jsx` — Global state for user authentication and session.
- `src/pages/`
  - `Dashboard.jsx` — Student home showing available and completed tests.
  - `LandingPage.jsx` — Public welcome page with portal overview.
  - `Login.jsx / Register.jsx` — Authentication pages with validation.
  - `Test.jsx` — The proctored assessment interface with timer.
  - `Results.jsx` — Summary view of a student's performance.
  - `ReviewPage.jsx` — Detailed question-by-question review of a test.
  - `admin/`
    - `AdminAnalytics.jsx` — Visual dashboard with performance charts.
    - `AdminTestsList.jsx` — List view for managing institutional tests.
    - `AdminQuestionsList.jsx` — Paginated view of the full question bank.
    - `AdminTestDetail.jsx` — Detailed view and editor for specific tests.


---

##  Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Chakra UI, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JSON Web Tokens (JWT), BcryptJS |
| **Analytics** | Recharts, json2csv |
| **Testing** | Jest, Supertest |
| **Build Tool** | Vite |

---

##  API Endpoints

### Auth Routes
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user (`@cit.edu.in` required). |
| POST | `/api/auth/login` | Public | Login and receive JWT in HTTP-only cookie. |
| POST | `/api/auth/logout` | User | Clear session cookies. |
| GET | `/api/auth/me` | User | Get current logged-in user details. |

### Test Routes
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/tests` | User | List all available tests. |
| GET | `/api/tests/:id/start` | User | Initialize/Resume a test attempt. |
| POST | `/api/tests/:id/submit` | User | Submit test answers and calculate score. |
| POST | `/api/tests/:id/violations` | User | Record a proctoring violation. |

### Admin Routes
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/analytics` | Admin | Get global performance metrics. |
| GET | `/api/admin/questions` | Admin | List and filter the question bank. |
| POST | `/api/admin/questions` | Admin | Create a new question. |
| POST | `/api/admin/tests` | Admin | Create a new timed test. |
| GET | `/api/admin/tests/:id/export` | Admin | Export test scores to CSV. |
| GET | `/api/admin/tests/:testId/violations` | Admin | View violation logs for a specific test. |

---

##  Database Schema

### User Model
- `name`: String (Required)
- `email`: String (Unique, CIT domain only)
- `password`: String (Hashed)
- `isAdmin`: Boolean (Default: false)

### Test Model
- `title`: String (Unique)
- `duration`: Number (Minutes)
- `questions`: Array of Question ObjectIDs

### Question Model
- `text`: String (Required)
- `options`: Array of Strings
- `correctAnswer`: String
- `category`: String (Trimmed)
- `explanation`: String

### Attempt & Submission Models
- `Attempt`: Tracks active/expired states, start/expiry times, and question order.
- `Submission`: Stores final score, answers map, and reference to the test/user.

---

##  Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/aptitude-portal.git
cd aptitude-portal
```

### 2. Environment Setup
Create a `.env` file in the `server/` directory and a `.env.local` in the `client/` directory based on the examples provided.

**Server `.env` Configuration:**
| Variable | Description | Example |
|---|---|---|
| `PORT` | Port for the backend server | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/cit` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |
| `CLIENT_ORIGIN` | URL of the frontend | `http://localhost:5173` |

### 3. Installation
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Run the Application
```bash
# Start backend (from server folder)
npm start

# Start frontend (from client folder)
npm run dev
```

---

##  Screenshots
*(Replace these placeholders with actual images once deployed)*

| Login Page | Student Dashboard |
|---|---|
| ![Login Placeholder](https://via.placeholder.com/400x250?text=Login+Page) | ![Dashboard Placeholder](https://via.placeholder.com/400x250?text=Student+Dashboard) |

| Assessment Interface | Admin Analytics |
|---|---|
| ![Test Placeholder](https://via.placeholder.com/400x250?text=Assessment+UI) | ![Analytics Placeholder](https://via.placeholder.com/400x250?text=Admin+Analytics) |

---

##  How Proctoring Works

1. **System Check**: Before starting, the app requests Fullscreen mode.
2. **Event Listeners**:
   - `visibilitychange`: Detects when the user switches tabs or minimizes the window.
   - `fullscreenchange`: Detects when the user exits the mandatory fullscreen mode.
3. **Automated Submission**:
   - Every violation is logged on the server.
   - On the **3rd violation**, the system triggers an automatic submission of the current answers to ensure integrity.

---

##  Scoring & Integrity

- **Server-Side Validation**: Scores are calculated on the backend by comparing submitted keys with the `correctAnswer` field in the database.
- **Unique Attempts**: Students are restricted to one submission per test.
- **Grace Period**: A small `SUBMIT_GRACE_MS` (default 5s) is allowed for network latency during auto-submissions.
- **Shuffling**: Questions are randomized per student attempt to mitigate collusive behavior.

---

##  Future Improvements
- [ ] **Email Notifications**: Automatic email delivery of performance reports.
- [ ] **Bulk Import**: Import questions via Excel/CSV for faster setup.
- [ ] **Advanced Proctoring**: Webcam-based AI monitoring for face detection.
- [ ] **Live Monitoring**: Real-time view for admins to see who is currently taking a test.
- [ ] **Leaderboards**: Competitive ranking for specific test categories.

---

##  License
Distributed under the **ISC License**. See `LICENSE` for more information.

---
*Built with ❤️ for CIT students.*