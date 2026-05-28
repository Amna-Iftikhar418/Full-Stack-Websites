# Wunderlust - Travel Listings Web App

## Project Overview

A full-stack Airbnb-inspired web application built with **Node.js, Express, MongoDB, and EJS**. Users can explore, create, edit, and manage travel listings with features including authentication, image uploads, categories, reviews, bookings, and search.

### Tech Stack
- **Backend**: Node.js, Express.js (v4)
- **Database**: MongoDB + Mongoose (v8)
- **Frontend**: EJS templates, Bootstrap CSS, HTML/CSS/JS
- **Authentication**: Passport.js with passport-local-mongoose
- **Image Upload**: Multer + Cloudinary (cloud storage)
- **Validation**: Joi schema validation
- **Security**: helmet, csurf (CSRF protection), express-rate-limit
- **Flash Messages**: connect-flash
- **Other**: method-override, express-session, ejs-mate (layout support)

### Architecture
MVC-style structure:
```
app.js                   # Express entry point, middleware, DB connection
schema.js                # Joi validation schemas (listing, review, booking)
cloudconfig.js           # Cloudinary configuration
loginauthentication.js   # Auth middleware (isLoggedIn, isOwner, isAuthor, saveRedirectUrl)
models/                  # Mongoose schemas (listing, review, users, booking)
routes/                  # Express route definitions
controllers/             # Route handler logic
views/                   # EJS templates (layouts, partials, pages)
public/                  # Static assets (CSS, JS, images)
uploads/                 # Temporary upload folder (gitignored)
init/                    # Database seeding/initialization scripts
utils/                   # Utility functions (asyncwrap, ExpressError, DateFormat)
```

### Key Models
- **Listing**: title, description, price, location, country, category (enum: Trending/Farms/Room/Mountain/Amazing Views/Pool/Castles/Beach/Iconic City), image (Cloudinary), latitude, longitude, reviews[], owner ref, date
- **User**: username (passport-local-mongoose), email, firstName, lastName, phone, bio, profileImage (Cloudinary), likes[] (ref Listing)
- **Review**: rating (1-5), comment, author ref
- **Booking**: checkIn, checkOut, status (pending/confirmed/cancelled), totalPrice, guests, listing ref, guest ref

### Routes
- `/listings` — listing CRUD
- `/listings/:id/reviews` — review CRUD
- `/listings/:id/bookings` — create booking, check availability, get booked dates
- `/bookings` — guest dashboard (`/guest`), host dashboard (`/host`), update status, cancel
- `/signup`, `/login`, `/logout` — auth
- `/profile` — view/update profile (with image upload)
- `/profile/edit` — edit profile form

### Features
- User authentication (signup/login/logout) via Passport.js
- CRUD operations for listings with owner authorization
- Review system with ratings; listing owner can also delete any review
- Image upload to Cloudinary (listings and profile pictures)
- Booking system: guests book listings, hosts confirm/cancel, date availability checking
- Guest and host booking dashboards
- User profile with bio, phone, firstName, lastName, profile image
- Liked/favorited listings per user
- Dynamic search & filter by country/category
- Flash messages for user feedback
- CSRF protection on all forms via csurf
- Rate limiting on `/login` and `/signup` (20 req / 15 min)
- Helmet security headers
- Responsive UI with Bootstrap + EJS layouts/partials
- Indexes on Listing (category, country) and Booking (listing + dates)

## Building and Running

### Prerequisites
- Node.js
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Setup
1. Install dependencies:
   ```
   npm install
   ```
2. Configure environment variables in `.env` (already present):
   - `MONGO_URL` - MongoDB connection string
   - `SESSION_SECRET` - Session signing key
   - `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` - Cloudinary credentials
   - `PORT` - Server port (default: 8080)
   - `NODE_ENV` - Environment mode (development/production)

### Run
```
node app.js
```
Server starts on `http://localhost:8080` (or configured PORT).

### Testing
No test framework is currently configured. The `npm test` script outputs an error.

## Development Conventions

- **Error Handling**: Centralized Express error middleware; custom `ExpressError` class in `utils/`
- **Async Wrappers**: Routes use `asyncwrap` utility to catch async errors
- **Validation**: Joi schemas in `schema.js` validate listing, review, and booking input
- **Auth Middleware**: `loginauthentication.js` exports `isLoggedIn`, `isOwner`, `isAuthor`, `saveRedirectUrl`
- **CSRF**: All state-changing forms must include `<input type="hidden" name="_csrf" value="<%= csrfToken %>">`
- **Templates**: EJS with `ejs-mate` for layout inheritance and partials
- **Middleware Order**: dotenv → helmet → session → flash → passport → locals (curruser, countries, csrfToken) → CSRF → routes → error handlers

## Important Notes

- The `.env` file contains real credentials — **never commit this to version control**
- The `.gitignore` correctly excludes `.env`, `uploads/`, and `node_modules/`
- Cloudinary uploads use the folder `Wunderlust_DEV`
- Session cookies expire after 7 days; `secure: true` only in production
- MongoDB cascading delete: deleting a listing also deletes its associated reviews (post `findOneAndDelete` hook)
- `res.locals.curruser` is populated with likes populated (via `User.findById().populate("likes")`) on every request
- `res.locals.countries` is populated from `Listing.distinct("country")` on every request for navbar filter
