  Wunderlust — Full Audit Report

  CRITICAL BUGS & SECURITY VULNERABILITIES

  🔴 Critical (Fix Immediately)

  ┌─────┬────────────────────────────────────────────────────────────────────────────────────────────────────────┬────────────────────────────┬───────────────┐  
  │  #  │                                                 Issue                                                  │         File:Line          │     Type      │  
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────────────┼───────────────┤  
  │ 1   │ Mass assignment — ...req.body spread directly into findByIdAndUpdate lets any user overwrite owner,    │ controllers/listing.js:128 │ Security      │  
  │     │ reviews, etc.                                                                                          │                            │               │  
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────────────┼───────────────┤  
  │ 2   │ Missing isOwner on GET edit route — any logged-in user can view & submit the edit form for any listing │ routes/listing.js:32       │ Authorization │  
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────────────┼───────────────┤  
  │ 3   │ No validatelisting middleware on PUT — edit endpoint skips Joi validation entirely                     │ routes/listing.js:34       │ Validation    │  
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────────────┼───────────────┤  
  │ 4   │ No CSRF protection — all 11 POST/PUT/DELETE forms are vulnerable; attacker can forge requests          │ All forms                  │ Security      │  
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────────────┼───────────────┤  
  │ 5   │ next undefined in signup error handler — runtime crash if login fails during registration              │ controllers/user.js:22     │ Bug           │  
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────────────┼───────────────┤  
  │ 6   │ ReDoS in search — user input fed directly into new RegExp(country, "i")                                │ controllers/listing.js:74  │ DoS           │  
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────────────┼───────────────┤  
  │ 7   │ DOM XSS — availMsg.innerHTML = ... + data.message uses raw API response                                │ views/bookings/new.ejs:128 │ XSS           │  
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────────────┼───────────────┤  
  │ 8   │ DOM XSS in map popup — template literal with ${title} / ${location} injected as HTML                   │ public/js/map.js:46        │ XSS           │  
  └─────┴────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────────────────────────┴───────────────┘  

  🟠 High Severity

  ┌─────┬────────────────────────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────────┐
  │  #  │                                           Issue                                            │                 File:Line                 │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ 9   │ No security headers (no Helmet.js) — missing CSP, X-Frame-Options, HSTS, etc.              │ app.js                                    │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ 10  │ No rate limiting on /login, /signup, /reviews                                              │ app.js                                    │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ 11  │ No length limits in Joi schemas — title, description, comment accept unlimited input       │ schema.js                                 │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ 12  │ toggleLike accesses user.likes without null-checking if user exists                        │ controllers/listing.js:229                │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ 13  │ Nominatim API calls have no try/catch — unhandled rejection crashes request                │ controllers/listing.js:49, 113            │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ 14  │ checkIn Joi validation uses min(new Date()) at server startup, not per-request             │ schema.js:25                              │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ 15  │ No MongoDB ObjectId validation before findById() calls                                     │ Multiple controllers                      │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ 16  │ Price field in new/edit listing has type="text" and wrong error message ("valid password") │ views/listings/new.ejs:53, edit.ejs:68-70 │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ 17  │ accept attribute missing on file input — accepts any file type client-side                 │ views/listings/new.ejs:45                 │
  └─────┴────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────────┘

  🟡 Medium Severity

  ┌─────┬─────────────────────────────────────────────────────────────────────────────┬────────────────────────────────┐
  │  #  │                                    Issue                                    │           File:Line            │
  ├─────┼─────────────────────────────────────────────────────────────────────────────┼────────────────────────────────┤
  │ 18  │ No password complexity enforcement — any password accepted                  │ controllers/user.js:18         │
  ├─────┼─────────────────────────────────────────────────────────────────────────────┼────────────────────────────────┤
  │ 19  │ No unique constraint on email field — duplicate emails allowed              │ models/users.js                │
  ├─────┼─────────────────────────────────────────────────────────────────────────────┼────────────────────────────────┤
  │ 20  │ Referrer-based redirect open redirect risk                                  │ controllers/listing.js:255     │
  ├─────┼─────────────────────────────────────────────────────────────────────────────┼────────────────────────────────┤
  │ 21  │ Inconsistent HTTP status codes in booking availability response             │ controllers/booking.js:152,170 │
  ├─────┼─────────────────────────────────────────────────────────────────────────────┼────────────────────────────────┤
  │ 22  │ destroyReview — no null check on listing before $pull operation             │ controllers/review.js:21       │
  ├─────┼─────────────────────────────────────────────────────────────────────────────┼────────────────────────────────┤
  │ 23  │ Booking availability endpoints unauthenticated — info disclosure            │ routes/booking.js:23-24        │
  ├─────┼─────────────────────────────────────────────────────────────────────────────┼────────────────────────────────┤
  │ 24  │ Race condition on like/unlike (no atomic operation)                         │ controllers/listing.js:237     │
  ├─────┼─────────────────────────────────────────────────────────────────────────────┼────────────────────────────────┤
  │ 25  │ edit-profile.ejs has layout tag commented out — inconsistent page rendering │ views/user/edit-profile.ejs:1  │
  ├─────┼─────────────────────────────────────────────────────────────────────────────┼────────────────────────────────┤
  │ 26  │ No checkOut > checkIn validation in HTML (JS validates too late)            │ views/bookings/new.ejs:38      │
  ├─────┼─────────────────────────────────────────────────────────────────────────────┼────────────────────────────────┤
  │ 27  │ Stack traces logged via console.error — exposes internals in production     │ app.js:117                     │
  ├─────┼─────────────────────────────────────────────────────────────────────────────┼────────────────────────────────┤
  │ 28  │ Missing password confirmation field on signup                               │ views/user/userform.ejs        │
  └─────┴─────────────────────────────────────────────────────────────────────────────┴────────────────────────────────┘

  ---
  MISSING FEATURES (vs Real Airbnb)

  Tier 1 — CRITICAL (app can't function without these)

  ┌──────────────────────────┬────────────┬────────────────────────────────────────────────────────────────┐
  │         Feature          │   Status   │                             Notes                              │
  ├──────────────────────────┼────────────┼────────────────────────────────────────────────────────────────┤
  │ Payment processing       │ ❌ Missing │ No Stripe/payment gateway; no invoices, no transactions        │
  ├──────────────────────────┼────────────┼────────────────────────────────────────────────────────────────┤
  │ Messaging/inbox          │ ❌ Missing │ No model, no routes, no views — guests/hosts can't communicate │
  ├──────────────────────────┼────────────┼────────────────────────────────────────────────────────────────┤
  │ Email/push notifications │ ❌ Missing │ No nodemailer/SendGrid; users must manually check dashboards   │
  ├──────────────────────────┼────────────┼────────────────────────────────────────────────────────────────┤
  │ Email/phone verification │ ❌ Missing │ Accounts activate with no email confirmation                   │
  ├──────────────────────────┼────────────┼────────────────────────────────────────────────────────────────┤
  │ Multi-image uploads      │ ❌ Missing │ Only 1 image per listing; no gallery, no lightbox              │
  ├──────────────────────────┼────────────┼────────────────────────────────────────────────────────────────┤
  │ Admin panel              │ ❌ Missing │ No admin role, no moderation, no analytics                     │
  └──────────────────────────┴────────────┴────────────────────────────────────────────────────────────────┘

  Tier 2 — HIGH (major trust/revenue features)

  ┌───────────────────────────────┬────────────┬─────────────────────────────────────────────────────────────────┐
  │            Feature            │   Status   │                              Notes                              │
  ├───────────────────────────────┼────────────┼─────────────────────────────────────────────────────────────────┤
  │ Dynamic pricing               │ ❌ Missing │ No weekly/monthly discounts, cleaning fees, service fees, taxes │
  ├───────────────────────────────┼────────────┼─────────────────────────────────────────────────────────────────┤
  │ Detailed ratings breakdown    │ ❌ Missing │ Only 1–5 stars; no accuracy/cleanliness/location sub-scores     │
  ├───────────────────────────────┼────────────┼─────────────────────────────────────────────────────────────────┤
  │ Calendar UX                   │ Partial    │ API exists but no interactive date picker UI, no minimum stay   │
  ├───────────────────────────────┼────────────┼─────────────────────────────────────────────────────────────────┤
  │ Map search                    │ Partial    │ Map on detail page only; no search-by-area, no listing clusters │
  ├───────────────────────────────┼────────────┼─────────────────────────────────────────────────────────────────┤
  │ Superhost / host verification │ ❌ Missing │ No response rate, no badges, no background checks               │
  ├───────────────────────────────┼────────────┼─────────────────────────────────────────────────────────────────┤
  │ Advanced search filters       │ ❌ Missing │ Only country + category; no price range, amenities, capacity    │
  └───────────────────────────────┴────────────┴─────────────────────────────────────────────────────────────────┘

  Tier 3 — MEDIUM (nice-to-have)

  ┌──────────────────────────────────────────┬────────────┐
  │                 Feature                  │   Status   │
  ├──────────────────────────────────────────┼────────────┤
  │ SEO / Open Graph meta tags               │ ❌ Missing │
  ├──────────────────────────────────────────┼────────────┤
  │ Host can reply to reviews                │ ❌ Missing │
  ├──────────────────────────────────────────┼────────────┤
  │ Refund & cancellation policies           │ ❌ Missing │
  ├──────────────────────────────────────────┼────────────┤
  │ PWA / mobile app                         │ ❌ Missing │
  ├──────────────────────────────────────────┼────────────┤
  │ Pagination (all listings load at once)   │ ❌ Missing │
  ├──────────────────────────────────────────┼────────────┤
  │ Structured logging (replace console.log) │ ❌ Missing │
  └──────────────────────────────────────────┴────────────┘

  ---
  QUICK WIN FIXES (easy, high impact)

  npm install helmet express-rate-limit escape-string-regexp csurf

  1. routes/listing.js:32 — add isOwner to the GET edit route
  2. routes/listing.js:34 — add validatelisting middleware to PUT
  3. controllers/listing.js:128 — replace ...req.body with explicit field picks
  4. views/bookings/new.ejs:128 — replace innerHTML with textContent
  5. public/js/map.js:46 — escape title/location before injecting as HTML
  6. views/listings/new.ejs:53 — add type="number" min="1" and fix error message
  7. schema.js — add .max() to all string fields, fix min(new Date())
  8. models/users.js — add unique: true on email
  9. controllers/listing.js:74 — use escape-string-regexp before new RegExp()
  10. app.js — add helmet() and express-rate-limit on auth routes

  ---
  Effort Estimate to Production-Ready

  ┌────────────────────────────┬─────────────┐
  │            Area            │   Effort    │
  ├────────────────────────────┼─────────────┤
  │ Fix all critical/high bugs │ ~3–5 days   │
  ├────────────────────────────┼─────────────┤
  │ Payment (Stripe)           │ 2–3 weeks   │
  ├────────────────────────────┼─────────────┤
  │ Messaging system           │ 2–3 weeks   │
  ├────────────────────────────┼─────────────┤
  │ Email notifications        │ 1–2 weeks   │
  ├────────────────────────────┼─────────────┤
  │ Multi-image upload         │ 1 week      │
  ├────────────────────────────┼─────────────┤
  │ Admin panel                │ 2–3 weeks   │
  ├────────────────────────────┼─────────────┤
  │ Dynamic pricing & fees     │ 1 week      │
  ├────────────────────────────┼─────────────┤
  │ Total                      │ ~3–4 months │
  └────────────────────────────┴─────────────┘

  The foundation (MVC structure, auth, Cloudinary, bookings) is solid — the biggest gaps are payment, messaging, notifications, and the security hardening items 
  above.