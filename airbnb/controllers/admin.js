const mongoose = require("mongoose");
const User = require("../models/users");
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const Review = require("../models/review");
const Message = require("../models/message");
const Conversation = require("../models/conversation");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports.dashboard = async (req, res) => {
    const [
        totalUsers,
        verifiedUsers,
        totalListings,
        totalBookings,
        paidBookings,
        pendingBookings,
        totalReviews,
        totalMessages,
        totalRevenueAgg,
        recentBookings,
        recentUsers,
        topCountries,
    ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ isVerified: true }),
        Listing.countDocuments({}),
        Booking.countDocuments({}),
        Booking.countDocuments({ paymentStatus: "paid" }),
        Booking.countDocuments({ status: "pending" }),
        Review.countDocuments({}),
        Message.countDocuments({}),
        Booking.aggregate([
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]),
        Booking.find({}).sort({ createdAt: -1 }).limit(8).populate("listing", "title").populate("guest", "username"),
        User.find({}).sort({ createdAt: -1 }).limit(8).select("username email isVerified isAdmin createdAt"),
        Listing.aggregate([
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]),
    ]);

    const totalRevenue = (totalRevenueAgg[0] && totalRevenueAgg[0].total) || 0;

    res.render("admin/dashboard", {
        stats: {
            totalUsers, verifiedUsers, totalListings, totalBookings,
            paidBookings, pendingBookings, totalReviews, totalMessages,
            totalRevenue,
        },
        recentBookings, recentUsers, topCountries,
    });
};

module.exports.users = async (req, res) => {
    const q = (req.query.q || "").trim();
    const filter = q ? {
        $or: [
            { username: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
            { email: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        ]
    } : {};
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);
    res.render("admin/users", { users, q });
};

module.exports.toggleAdmin = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return res.redirect("/admin/users");
    const user = await User.findById(id);
    if (!user) return res.redirect("/admin/users");
    if (String(user._id) === String(req.user._id)) {
        req.flash("error", "You cannot change your own admin flag");
        return res.redirect("/admin/users");
    }
    user.isAdmin = !user.isAdmin;
    await user.save();
    req.flash("success", `Admin ${user.isAdmin ? "granted to" : "revoked from"} ${user.username}`);
    res.redirect("/admin/users");
};

module.exports.toggleSuspend = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return res.redirect("/admin/users");
    const user = await User.findById(id);
    if (!user) return res.redirect("/admin/users");
    if (String(user._id) === String(req.user._id)) {
        req.flash("error", "You cannot suspend yourself");
        return res.redirect("/admin/users");
    }
    user.isSuspended = !user.isSuspended;
    await user.save();
    req.flash("success", `${user.username} ${user.isSuspended ? "suspended" : "reinstated"}`);
    res.redirect("/admin/users");
};

module.exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return res.redirect("/admin/users");
    if (String(id) === String(req.user._id)) {
        req.flash("error", "You cannot delete yourself");
        return res.redirect("/admin/users");
    }
    await User.findByIdAndDelete(id);
    req.flash("success", "User deleted");
    res.redirect("/admin/users");
};

module.exports.listings = async (req, res) => {
    const listings = await Listing.find({})
        .populate("owner", "username email")
        .sort({ date: -1 })
        .limit(200);
    res.render("admin/listings", { listings });
};

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return res.redirect("/admin/listings");
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted");
    res.redirect("/admin/listings");
};

module.exports.bookings = async (req, res) => {
    const bookings = await Booking.find({})
        .populate("listing", "title")
        .populate("guest", "username email")
        .sort({ createdAt: -1 })
        .limit(200);
    res.render("admin/bookings", { bookings });
};

module.exports.reviews = async (req, res) => {
    const reviews = await Review.find({})
        .populate("author", "username")
        .sort({ createdAt: -1 })
        .limit(200);
    res.render("admin/reviews", { reviews });
};

module.exports.deleteReview = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return res.redirect("/admin/reviews");
    await Review.findByIdAndDelete(id);
    await Listing.updateMany({ reviews: id }, { $pull: { reviews: id } });
    req.flash("success", "Review deleted");
    res.redirect("/admin/reviews");
};
