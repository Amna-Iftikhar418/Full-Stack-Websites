const express = require("express");
const router = express.Router({ mergeParams: true });
const asyncwrap = require("../utils/asyncwrap");
const { isLoggedIn, isOwner } = require("../loginauthentication");
const bookingController = require("../controllers/booking");
const { bookingSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");

const validateBooking = (req, res, next) => {
    const { error } = bookingSchema.validate(req.body, { allowUnknown: true, stripUnknown: true });
    if (error) {
        const errorMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errorMsg);
    }
    next();
};

// Booking routes
router.get("/new", isLoggedIn, asyncwrap(bookingController.renderBookingForm));
router.post("/", isLoggedIn, validateBooking, asyncwrap(bookingController.createBooking));

// AJAX endpoints for availability
router.get("/availability", asyncwrap(bookingController.checkAvailability));
router.get("/booked-dates", asyncwrap(bookingController.getBookedDates));
router.get("/quote", asyncwrap(bookingController.getQuote));

module.exports = router;
