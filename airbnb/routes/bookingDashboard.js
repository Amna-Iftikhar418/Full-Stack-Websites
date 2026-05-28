const express = require("express");
const router = express.Router();
const asyncwrap = require("../utils/asyncwrap");
const { isLoggedIn } = require("../loginauthentication");
const bookingController = require("../controllers/booking");

// Guest dashboard: view my bookings (default)
router.get("/", isLoggedIn, asyncwrap(bookingController.guestDashboard));

// Guest dashboard: view my bookings (explicit)
router.get("/guest", isLoggedIn, asyncwrap(bookingController.guestDashboard));

// Host dashboard: view bookings for my listings
router.get("/host", isLoggedIn, asyncwrap(bookingController.hostDashboard));

// Update booking status (host only)
router.put("/:bookingId/status", isLoggedIn, asyncwrap(bookingController.updateBookingStatus));

// Cancel booking (guest only)
router.put("/:bookingId/cancel", isLoggedIn, asyncwrap(bookingController.cancelBooking));

module.exports = router;
