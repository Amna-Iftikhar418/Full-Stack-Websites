# 🎬 Netflix Clone

A full-stack Netflix clone built with **React (Vite)** and **Express + MongoDB**, featuring email/password authentication via **Passport.js** with session-based auth.

> **Author:** Amna Iftikhar  
> **Purpose:** Educational / Portfolio Project

---

## ✨ Features

- 🔐 **User Authentication** — Signup & Sign In with secure password hashing (bcrypt via `passport-local-mongoose`)
- 🍪 **Session Management** — Cookie-based sessions with `express-session`
- 🎞️ **Movie Carousel** — Horizontal slider with 10 films, click to view details in a modal
- 📺 **Netflix-style UI** — Hero banner, FAQ accordion, feature cards, and footer
- 🎨 **Responsive Design** — Styled with Bootstrap 5 and custom CSS
- 👁️ **Password Visibility Toggle** — Show/hide password on auth forms

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, React Router DOM, Bootstrap 5, React-Bootstrap, Font Awesome |
| **Backend** | Node.js, Express 5, Passport.js, express-session |
| **Database** | MongoDB, Mongoose |
| **Auth** | passport-local-mongoose, bcryptjs |
| **Dev Tools** | nodemon, ESLint |

---

## 📁 Project Structure

```
Netflix/
├── react-app/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx             # Router: /, /signup, /signin
│   │   ├── main.jsx            # React entry point
│   │   ├── Home.jsx            # Landing page with hero section
│   │   ├── SignIn.jsx          # Login form (email + password)
│   │   ├── SignUp.jsx          # Registration form
│   │   ├── Carousel.jsx        # Movie carousel with modal preview
│   │   ├── Frame.jsx           # "More Reasons to Join" cards
│   │   ├── FAQ.jsx             # FAQ accordion
│   │   ├── Footer.jsx          # Site footer
│   │   └── Data/               # Static data (films, cards, FAQs)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend (Express + MongoDB)
│   ├── index.js                # Express server + auth routes
│   ├── modals/
│   │   └── user.js             # User schema with passport plugin
│   ├── .env                    # Environment variables
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Netflix
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../react-app
   npm install
   ```

3. **Configure environment variables**

   Edit `server/.env`:
   ```env
   PORT=5000
   MONGO_URL=mongodb://127.0.0.1:27017/netflixClone
   SESSION_SECRET=your-secret-key-here
   CLIENT_URL=http://localhost:5173
   ```

4. **Start MongoDB** (if not already running)
   ```bash
   # Windows (if MongoDB is installed as a service)
   net start MongoDB

   # Or run manually
   mongod
   ```

5. **Run the application**

   Open **two terminals**:

   **Terminal 1 — Backend**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:5000`

   **Terminal 2 — Frontend**
   ```bash
   cd react-app
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register new user (email + password) |
| `POST` | `/login` | Authenticate user (email + password) |
| `GET`  | `/check-session` | Check if user is authenticated |
| `POST` | `/logout` | Destroy session and clear cookie |

### Request/Response Examples

**Signup**
```json
POST /signup
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Login**
```json
POST /login
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

---

## 🔐 Authentication Flow

1. **Signup** → User registers with email + password. Password is automatically hashed by `passport-local-mongoose` (stores `hash` + `salt`).
2. **Login** → User authenticates via Passport LocalStrategy. On success, session cookie (`connect.sid`) is sent to client.
3. **Session Check** → On page load, frontend calls `/check-session` to determine auth state.
4. **Logout** → Destroys session and clears cookie.

> **Note:** All auth requests use `credentials: "include"` to share session cookies across origins (CORS configured for `localhost:5173`).

---

## 🎨 Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home, Carousel, Frame, FAQ, Footer | Landing page |
| `/signup` | SignUp | Registration form |
| `/signin` | SignIn | Login form |

---

## 📦 Available Scripts

### Frontend (`react-app/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend (`server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with nodemon (auto-restart) |
| `npm start` | Start server (production) |

---

## 🗃️ Database Schema

**User Model** (`server/modals/user.js`)

| Field | Type | Notes |
|-------|------|-------|
| `email` | String | Required, unique |
| `hash` | String | Auto-managed by passport-local-mongoose |
| `salt` | String | Auto-managed by passport-local-mongoose |

> The `passport-local-mongoose` plugin handles all password hashing automatically. Never store plain-text passwords.

---

## ⚙️ Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGO_URL` | MongoDB connection string | `mongodb://127.0.0.1:27017/netflixClone` |
| `SESSION_SECRET` | Secret for signing session cookies | `your-secret-key` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |

---

## 📸 Screenshots

| Feature | Description |
|---------|-------------|
| **Hero Section** | Netflix-style banner with email input → redirects to sign-in |
| **Movie Carousel** | Scrollable film cards, click for modal with details |
| **Auth Forms** | Email + password with visibility toggle |
| **FAQ Accordion** | Expandable questions with animated toggle |
| **Feature Cards** | "More Reasons to Join" section |

---

## 🐛 Known Limitations

- **Static movie data** — Films are hardcoded in `src/Data/Film.jsx` (not a live API)
- **No TypeScript** — Uses plain JavaScript/JSX
- **No test suite** — Testing not yet configured
- **Local MongoDB only** — No cloud database support (e.g., MongoDB Atlas)

---

## 📄 License

Copyright © 2025 Amna Iftikhar. All rights reserved.

This project is for **educational purposes only**. Redistribution or reproduction without prior permission is not permitted.

---

## 🙏 Acknowledgments

- Built as a learning project for full-stack development
- UI inspired by [Netflix](https://www.netflix.com)
- Uses [Font Awesome](https://fontawesome.com) for icons
- Styled with [Bootstrap 5](https://getbootstrap.com)

---

**Happy Coding! 🚀**
