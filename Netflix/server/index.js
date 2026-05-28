const express = require("express");
const app = express();
const mongoose = require("mongoose")
const User = require("./modals/user")
const session = require('express-session')
const cors = require('cors');
const flash = require("connect-flash")
const passport = require("passport")

const LocalStrategy = require("passport-local").Strategy
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
require("dotenv").config();
const port = process.env.PORT ;
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

let mongo_url =  process.env.MONGO_URL;
const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}
app.use(session(sessionOptions))
app.use(flash());
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.success = req.flash("success")
  next();
})

app.post("/signup", async (req, res) => {
  try {
    let { email, password } = req.body;
    const user = new User({ email });
    await User.register(user, password)

    res.status(200).json({ message: "Signup successful", user: { id: user._id, email: user.email } });
  } catch (err) {
    if (err.name === "UserExistsError") {
      return res.status(400).json({ message: "User already exists!" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});


app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    if (!user) {
      console.log("Authentication failed for email:", req.body.email);
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({ message: "Successfully logged in", user: { email: user.email } });
    });
  })(req, res, next);
});
app.get("/check-session", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ loggedIn: true, user: req.user });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    req.session.destroy();
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

main().then((res) => {
  console.log("connected to DB")
}).catch((err) => {
  console.log(err)
})
async function main() {
  await mongoose.connect(mongo_url)
}

app.listen(port, () => {
  console.log(`request is listening at port ${port}`)
})
