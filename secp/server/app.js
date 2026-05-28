require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./modal/user");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const LocalStrategy = require("passport-local").Strategy;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://127.0.0.1:5500"],
    credentials: true,
  })
);
app.use(
  session({
     secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose
    .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(" Mongo Error:", err));


app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path} - SessionID: ${req.sessionID}`);
  next();
});


app.post("/signUp", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    let newUser = new User({ username, email });
    await User.register(newUser, password);
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error registering user" });
  }
});


app.post("/login", async (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.json({ message: "You are already logged in" });
  }

  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.status(401).json({ message: "User not found. Please sign up first." });
  }


  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: "Invalid username or password" });

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({ message: "Logged in successfully", user });
    });
  })(req, res, next);
});


app.post("/logout", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({ message: "Already logged out" });
  }
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out successfully" });
    });
  });
});

app.listen(process.env.PORT, () => {
  console.log("Server running ");
});
