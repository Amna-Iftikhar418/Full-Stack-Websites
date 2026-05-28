const crypto = require("crypto");
const User = require("../models/users");
const cloudinary = require('../cloudconfig');
const email = require("../utils/email");

module.exports.signup = (req, res) => {
    res.render("user/userform.ejs");
};

module.exports.postSignup = async (req, res, next) => {
    try {
        let { username, email: emailAddr, password } = req.body;
        if (!password || password.length < 8) {
            req.flash("error", "Password must be at least 8 characters");
            return res.redirect("/signup");
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        let newUser = new User({
            email: emailAddr,
            username,
            isVerified: false,
            verificationToken: token,
            verificationTokenExpires: expires,
        });

        const registeredUser = await User.register(newUser, password);

        await email.sendVerificationEmail(registeredUser, token);

        req.logIn(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Wunderlust! Please check your email to verify your account.");
            res.redirect("/verify/pending");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

module.exports.login = (req, res) => {
    res.render("user/login.ejs");
};

module.exports.postlogin = async (req, res) => {
    req.flash("success", "Welcome back to Wunderlust");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if (err) return next(err);
        req.flash("success", "you logged out");
        res.redirect("/listings");
    });
};

module.exports.showProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    let hostStats = null;
    try {
        const { getHostStats } = require("../utils/hostStats");
        hostStats = await getHostStats(user._id);
    } catch (e) {
        hostStats = null;
    }
    res.render("user/profile.ejs", { user, hostStats });
};

module.exports.editProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("user/edit-profile.ejs", { user });
};

module.exports.processEditProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    const { firstName, lastName, phone, bio } = req.body;
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    user.bio = bio;

    if (req.file) {
        if (user.profileImage && user.profileImage.filename) {
            await cloudinary.uploader.destroy(user.profileImage.filename);
        }
        user.profileImage = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    await user.save();
    req.flash("success", "Profile updated successfully!");
    res.redirect("/profile");
};

module.exports.updateProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    const { firstName, lastName, phone, bio } = req.body;
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    user.bio = bio;

    if (req.file) {
        if (user.profileImage && user.profileImage.filename) {
            await cloudinary.uploader.destroy(user.profileImage.filename);
        }
        user.profileImage = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    await user.save();
    res.json({ success: true, message: "Profile updated successfully!" });
};

module.exports.verifyPending = (req, res) => {
    if (!req.user) {
        req.flash("error", "Please login first");
        return res.redirect("/login");
    }
    if (req.user.isVerified) {
        req.flash("success", "Your email is already verified");
        return res.redirect("/listings");
    }
    res.render("user/verify-pending.ejs", { user: req.user });
};

module.exports.verifyToken = async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
        req.flash("error", "Verification link is invalid or expired");
        return res.redirect("/verify/pending");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    req.flash("success", "Email verified! Welcome to Wunderlust.");
    res.redirect("/listings");
};

module.exports.resendVerification = async (req, res) => {
    if (!req.user) {
        req.flash("error", "Login required");
        return res.redirect("/login");
    }
    if (req.user.isVerified) {
        req.flash("success", "Your email is already verified");
        return res.redirect("/listings");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const user = await User.findById(req.user._id);
    user.verificationToken = token;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await email.sendVerificationEmail(user, token);
    req.flash("success", "Verification email resent");
    res.redirect("/verify/pending");
};
