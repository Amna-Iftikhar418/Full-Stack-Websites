const Listing = require("../models/listing")
const Review = require("../models/review")


module.exports.postReview = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    const r = req.body.review || {};
    const pick = (v) => {
        const n = Number(v);
        return n >= 1 && n <= 5 ? n : undefined;
    };
    const newReview = new Review({
        comment: r.comment,
        rating: pick(r.rating),
        cleanliness: pick(r.cleanliness),
        accuracy: pick(r.accuracy),
        location: pick(r.location),
        communication: pick(r.communication),
        checkIn: pick(r.checkIn),
        value: pick(r.value),
        author: req.user._id
    });
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Successfully Add review");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyReview = async (req, res) => {
    let { id, reviewID } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
    await Review.findByIdAndDelete(reviewID);
    req.flash("success", "Successfully Deleted review");
    res.redirect(`/listings/${id}`)
}