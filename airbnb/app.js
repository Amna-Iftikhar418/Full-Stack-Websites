//http://localhost:8080/listings
if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose")
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const csurf = require("csurf");
const path = require("path")
const session = require("express-session")
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const flash = require("connect-flash");
const passport = require("passport")
const Listing=require("./models/listing.js")
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/users.js")
const Conversation = require("./models/conversation.js")
const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;

const sessionOptions = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    }
}
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(async (req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    if (req.user) {
        try {
            const userWithLikes = await User.findById(req.user._id).populate("likes");
            if (userWithLikes && userWithLikes.isSuspended && !req.path.startsWith("/logout")) {
                req.logOut(() => {});
                req.flash("error", "Your account has been suspended. Contact support.");
                return res.redirect("/login");
            }
            res.locals.curruser = userWithLikes;
        } catch (err) {
            console.error("Error populating user likes:", err);
            res.locals.curruser = req.user;
        }
        try {
            res.locals.unreadCount = await Conversation.countDocuments({ unreadBy: req.user._id });
        } catch (err) {
            console.error("Failed to count unread conversations:", err);
            res.locals.unreadCount = 0;
        }
    } else {
        res.locals.curruser = null;
        res.locals.unreadCount = 0;
    }

    res.locals.showFooter = true;
    res.locals.showHeader = true;

    try {
        const countries = await Listing.distinct("country");
        res.locals.countries = countries || [];
    } catch (err) {
        console.error("Failed to fetch countries:", err);
        res.locals.countries = [];
    }

    next();
});


const asyncwrap = require("./utils/asyncwrap.js")
const listing = require("./routes/listing.js")
const review = require("./routes/review.js")
const user = require("./routes/user.js")
const booking = require("./routes/booking.js")
const bookingDashboard = require("./routes/bookingDashboard.js")
const payment = require("./routes/payment.js")
const message = require("./routes/message.js")
const admin = require("./routes/admin.js")

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
// Stripe webhook must receive raw body and be registered before CSRF
app.post("/stripe/webhook", express.raw({ type: "application/json" }), require("./controllers/payment").stripeWebhook);

const csrfProtection = csurf({ cookie: false });
app.use(csrfProtection);
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
  console.log(`Request received for: ${req.method} ${req.path}`);
  next();
});

let mongo_url = MONGO_URL;
main().then((res) => {
    console.log("connected to DB")
})
    .catch((err) => {
        console.log(err)
    })
async function main() {
    await mongoose.connect(mongo_url)
}

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many attempts, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/login", authLimiter);
app.use("/signup", authLimiter);

app.use("/listings", listing);
app.use("/listings/:id/reviews", review)
app.use("/listings/:id/bookings", booking);
app.use("/bookings", payment);
app.use("/bookings", bookingDashboard);
app.use("/inbox", message);
app.use("/admin", admin);
app.use("/", user);

// custom Error handling for all routes
app.use((req, res, next) => {
    next(new ExpressError(404, "page not found"));
});

// CSRF error handling
app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
        req.flash("error", "Invalid or expired form submission. Please try again.");
        return res.redirect("back");
    }
    next(err);
});

// general error handling
app.use((err, req, res, next) => {
    console.error("=== ERROR STACK ===\n", err.stack);
    let { status = 500, message = "something went wrong" } = err;
    res.status(status).render("listings/error", { message })
})

// port
app.listen(PORT, () => {
    console.log(`request is listening at ${PORT}` )
})
