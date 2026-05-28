Based on the CLAUDE.md file, here's the tech stack:

  Backend

  - Node.js + Express.js (v4) — server framework
  - MongoDB + Mongoose (v8) — database + ODM

  Frontend

  - EJS templates with ejs-mate (layout inheritance)
  - Bootstrap CSS — responsive UI
  - HTML / CSS / JS

  Authentication & Security

  - Passport.js + passport-local-mongoose — user auth
  - csurf — CSRF protection
  - helmet — HTTP security headers
  - express-rate-limit — rate limiting on login/signup

  File & Media

  - Multer — file upload handling
  - Cloudinary — cloud image storage (listings + profile pictures)

  Validation & Utilities

  - Joi — schema validation
  - connect-flash — flash messages
  - method-override — PUT/DELETE via HTML forms
  - express-session — session management
  - dotenv — environment config

  Dev / Infra

  - MongoDB Atlas (or local) for the database
  - No test framework currently configured
