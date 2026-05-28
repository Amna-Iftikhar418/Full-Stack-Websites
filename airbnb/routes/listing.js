const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const asyncwrap = require("../utils/asyncwrap")
const ExpressError = require("../utils/ExpressError.js")
const { listingSchema } = require("../schema.js")
const { isLoggedIn, isOwner } = require("../loginauthentication.js")
const listingController = require("../controllers/listing.js")
const multer = require('multer')
const { storage } = require("../cloudconfig.js")
const upload = multer({ storage })
const validatelisting = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errorMsg);
    } else {
        next();
    }
};
// IMPORTANT: /new must be defined BEFORE /:id routes to avoid conflicts
router.get("/new", isLoggedIn, listingController.renderNewForm);
router.get("/category/:category", listingController.category);
router.get("/search",listingController.search)
router.get("/map", asyncwrap(listingController.mapView));
router.get("/liked", isLoggedIn, asyncwrap(listingController.getLiked));
router.post("/:id/like", isLoggedIn, asyncwrap(listingController.toggleLike));
router.post("/:id/availability", isLoggedIn, isOwner, asyncwrap(listingController.toggleAvailability));

router.route("/")
    .get(asyncwrap(listingController.index))
    .post(isLoggedIn, upload.array('images', 6), validatelisting, asyncwrap(listingController.postNewForm));

router.get("/:id/edit", isLoggedIn, isOwner, asyncwrap(listingController.renderEditForm));
router.route("/:id")
    .put(isLoggedIn, isOwner, upload.array('images', 6), validatelisting, asyncwrap(listingController.postEditForm))
    .get(asyncwrap(listingController.show))
    .delete(isLoggedIn, isOwner, asyncwrap(listingController.destroy));




module.exports = router;
