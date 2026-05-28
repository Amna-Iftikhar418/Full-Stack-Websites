const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js")
const { reviewSchema } = require("../schema.js")
const Review = require("../models/review");
const asyncwrap = require("../utils/asyncwrap");
const { isLoggedIn, isAuthor } = require("../loginauthentication.js");
const reviewController = require("../controllers/review.js")
const validatereview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body.review)
    if (error) {
        let errorMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400, errorMsg);

    } else {
        next();
    }
}


router.post("/", isLoggedIn, validatereview, asyncwrap(reviewController.postReview));

router.delete("/:reviewID", isLoggedIn, isAuthor, asyncwrap(reviewController.destroyReview));

module.exports = router;