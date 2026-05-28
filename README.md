<div align="center">

# Amna Iftikhar — Full-Stack Web Dev Portfolio

### A curated collection of three full-stack web applications built from scratch using Node.js, React, MongoDB, and more.

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com)
[![Passport.js](https://img.shields.io/badge/Passport.js-Auth-34E27A?style=for-the-badge)](https://www.passportjs.org)

</div>

---

## Projects at a Glance

| # | Project | Stack | What It Does |
|---|---------|-------|--------------|
| 1 | [Wunderlust](#1--wunderlust--travel-listings-platform) | Node · Express · MongoDB · EJS | Airbnb-inspired travel listing & booking platform |
| 2 | [Netflix Clone](#2--netflix-clone) | React · Vite · Node · Express · MongoDB | Netflix-style streaming UI with full auth |
| 3 | [SECP Website](#3--secp-website) | HTML · CSS · JS · Node · Express · MongoDB | Multi-page corporate site with LEAP portal |

---

## 1. Wunderlust — Travel Listings Platform

> **[→ View Full README](./airbnb/README.md)**

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-Template-orange?style=flat-square)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_Storage-3448C5?style=flat-square)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=flat-square)

</div>

A fully-featured **Airbnb-inspired** web application where users explore, create, and manage travel listings — complete with bookings, reviews, and interactive maps.

### Highlights

- **Complete booking pipeline** — date picking with conflict detection, automatic price calculation, and guest/host dashboards for managing pending/confirmed/cancelled states
- **9 listing categories** — Trending, Farms, Room, Mountain, Amazing Views, Pool, Castles, Beach, Iconic City — with dynamic country and category filtering
- **Cloudinary image uploads** — for both listings and user profile pictures
- **Interactive Leaflet maps** — every listing has a map with a custom gradient pin
- **Layered security** — Helmet headers, CSRF tokens on all forms, rate-limiting on auth routes, Joi server-side validation, and session-cookie expiry

### Architecture

```
airbnb/
├── app.js              # Express entry point & middleware chain
├── models/             # Mongoose schemas — Listing, User, Review, Booking
├── routes/             # Express route definitions
├── controllers/        # Business logic separated from routing
├── views/              # EJS templates with ejs-mate layouts
└── public/             # Bootstrap 5 + 2 400-line custom CSS
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js v5 |
| Database | MongoDB + Mongoose |
| Frontend | EJS, Bootstrap 5, Vanilla JS |
| Auth | Passport.js, passport-local-mongoose |
| Storage | Cloudinary (images), Multer (upload handler) |
| Maps | Leaflet.js |
| Validation | Joi |

---

## 2. Netflix Clone

> **[→ View Full README](./Netflix/README.md)**

<div align="center">

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=flat-square&logo=bootstrap&logoColor=white)

</div>

A **full-stack Netflix clone** with a React + Vite frontend and an Express + MongoDB backend. Features a pixel-accurate Netflix UI — hero banner, movie carousel with modal previews, FAQ accordion, and feature cards — backed by a complete session-based authentication system.

### Highlights

- **Decoupled architecture** — React SPA on port 5173 communicates with an Express REST API on port 5000 via session cookies
- **Netflix-accurate UI** — hero section with email-to-signup redirect, horizontal film carousel with click-to-modal, animated FAQ accordion, and "More Reasons to Join" feature cards
- **Secure auth** — `passport-local-mongoose` handles bcrypt hashing + salting automatically; `/check-session` endpoint keeps the React app in sync with server state
- **Hot-reload dev experience** — `nodemon` on the backend, Vite HMR on the frontend

### Architecture

```
Netflix/
├── react-app/          # React 19 + Vite frontend
│   └── src/
│       ├── App.jsx     # React Router: /, /signup, /signin
│       ├── Home.jsx    # Landing page
│       ├── Carousel.jsx
│       ├── FAQ.jsx
│       └── Data/       # Static film, card, and FAQ data
└── server/             # Express backend
    ├── index.js        # Auth routes + session config
    └── modals/user.js  # Mongoose user schema
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router DOM |
| UI | Bootstrap 5, React-Bootstrap, Font Awesome |
| Backend | Node.js, Express.js v5 |
| Database | MongoDB + Mongoose |
| Auth | Passport.js, passport-local-mongoose, express-session |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register new user |
| `POST` | `/login` | Authenticate user |
| `GET` | `/check-session` | Verify current session |
| `POST` | `/logout` | Destroy session |

---

## 3. SECP Website

> **[→ View Full README](./secp/README.md)**

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)

</div>

A modern **multi-page corporate website** inspired by the Securities and Exchange Commission of Pakistan (SECP). Includes a full authentication system and the **LEAP company registration portal** — built without any frontend framework, demonstrating deep vanilla HTML/CSS/JS fundamentals.

### Highlights

- **LEAP Portal** — company/LLP name search and registration interface, the flagship feature of the site
- **Glassmorphism UI** — frosted-glass auth pages, gradient backgrounds, and smooth hover animations — all in hand-written CSS
- **No-framework frontend** — every interaction (fetch API calls, DOM manipulation, flash notifications) written in vanilla ES6+ JavaScript
- **Full auth loop** — Passport.js local strategy with session cookies, flash messages on every state transition (success/error), and clean logout with session teardown

### Pages

| Page | Description |
|------|-------------|
| Home | SECP overview and navigation hub |
| About Us | Organizational details and company info |
| Contact Us | Contact forms and complaint submission |
| LEAP Portal | Company/LLP registration with name search |
| Login / Signup | Glassmorphism-styled auth pages |

### Architecture

```
secp/
├── secpWebsite/        # Pure HTML + CSS + JS frontend
│   ├── index.html
│   ├── leap.html       # LEAP portal (flagship page)
│   ├── Login.html / SignUp.html
│   ├── style.css       # All page styles in one file
│   └── images/
└── server/             # Express backend
    ├── app.js          # Routes, Passport config, CORS
    └── modal/user.js   # Mongoose user schema
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| UI | Font Awesome 6.7, Google Fonts (Poppins) |
| Backend | Node.js, Express.js v5 |
| Database | MongoDB + Mongoose |
| Auth | Passport.js, passport-local-mongoose, express-session |

---

## Common Patterns Across All Projects

All three projects share these architectural decisions, reflecting consistent engineering discipline:

| Pattern | Implementation |
|---------|---------------|
| **Authentication** | Passport.js with `passport-local-mongoose` — password hashing/salting handled automatically, no plaintext passwords |
| **Session management** | `express-session` with signed cookies; credentials flow with `credentials: "include"` where cross-origin |
| **Database** | MongoDB + Mongoose with defined schemas and validation |
| **Environment config** | `.env` files with `dotenv` — secrets never hardcoded |
| **Error feedback** | Flash messages (`connect-flash`) surfaced on every auth and CRUD operation |

---

## Prerequisites (All Projects)

- **Node.js** v18 or higher
- **MongoDB** running locally (`mongod`) or a MongoDB Atlas connection string
- **npm** — comes bundled with Node.js

Wunderlust additionally requires a free **Cloudinary** account for image storage.

---

## Author

**Amna Iftikhar**
Built for learning and demonstrating full-stack web development — from database schema design to responsive frontend UI.

---

## License

Copyright © 2025 Amna Iftikhar. All rights reserved.
Each project in this repository is for **educational and portfolio purposes only**.
Redistribution or reuse without permission is prohibited.

---

<div align="center">
  <strong>If you find these projects helpful, drop a star!</strong>
</div>
