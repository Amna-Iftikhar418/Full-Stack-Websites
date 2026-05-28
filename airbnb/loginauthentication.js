const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged IN");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  if (String(listing.owner) !== String(req.user._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id, reviewID } = req.params;
  const review = await Review.findById(reviewID);
  const listing = await Listing.findById(id);

  if (!review || !listing) {
    req.flash("error", "Review or listing not found");
    return res.redirect(`/listings/${id}`);
  }

  const isReviewAuthor = String(review.author) === String(req.user._id);
  const isListingOwner = String(listing.owner) === String(req.user._id);

  if (!isReviewAuthor && !isListingOwner) {
    req.flash("error", "You are not authorized to delete this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "Login required");
    return res.redirect("/login");
  }
  if (req.user.isSuspended) {
    req.flash("error", "Your account has been suspended. Contact support.");
    return res.redirect("/login");
  }
  if (!req.user.isAdmin) {
    req.flash("error", "Admin access required");
    return res.redirect("/listings");
  }
  next();
};

module.exports.isVerified = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "Login required");
    return res.redirect("/login");
  }
  if (!req.user.isVerified) {
    req.flash("error", "Please verify your email to continue");
    return res.redirect("/verify/pending");
  }
  next();
};
