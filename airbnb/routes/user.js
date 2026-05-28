const express = require("express");
const router = express.Router();
const User = require("../models/users");
const asyncwrap = require("../utils/asyncwrap");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../loginauthentication");
const userController = require("../controllers/user");
const multer = require('multer');
const { storage } = require("../cloudconfig");
const upload = multer({ storage });

router.route("/signup")
    .get(userController.signup)
    .post(asyncwrap(userController.postSignup));

router.route("/login")
    .get(userController.login)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
        userController.postlogin
    );

router.get("/logout", userController.logout);

// Email verification
router.get("/verify/pending", userController.verifyPending);
router.post("/verify/resend", isLoggedIn, asyncwrap(userController.resendVerification));
router.get("/verify/:token", asyncwrap(userController.verifyToken));

// Profile routes
router.route("/profile")
    .get(isLoggedIn, asyncwrap(userController.showProfile))
    .put(isLoggedIn, upload.single('profileImage'), asyncwrap(userController.updateProfile));

router.route("/profile/edit")
    .get(isLoggedIn, userController.editProfile)
    .post(isLoggedIn, upload.single('profileImage'), asyncwrap(userController.processEditProfile));

module.exports = router;
