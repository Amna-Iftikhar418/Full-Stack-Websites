const Listing = require("../models/listing");
const Booking = require("../models/booking");
const Review = require("../models/review");

// Compute host stats: avg rating, total reviews, response rate, superhost flag
async function getHostStats(userId) {
    const listings = await Listing.find({ owner: userId }).select("_id reviews");
    const listingIds = listings.map(l => l._id);
    const reviewIds = listings.flatMap(l => l.reviews || []);

    const reviews = reviewIds.length
        ? await Review.find({ _id: { $in: reviewIds } }).select("rating")
        : [];

    const totalReviews = reviews.length;
    const avgRating = totalReviews
        ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews
        : 0;

    let responseRate = 0;
    let totalBookings = 0;
    if (listingIds.length) {
        totalBookings = await Booking.countDocuments({ listing: { $in: listingIds } });
        const responded = await Booking.countDocuments({
            listing: { $in: listingIds },
            status: { $in: ["confirmed", "cancelled"] }
        });
        responseRate = totalBookings ? Math.round((responded / totalBookings) * 100) : 0;
    }

    const isSuperhost =
        totalReviews >= 10 &&
        avgRating >= 4.8 &&
        responseRate >= 90 &&
        totalBookings >= 10;

    return {
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        totalListings: listings.length,
        totalBookings,
        responseRate,
        isSuperhost
    };
}

module.exports = { getHostStats };
