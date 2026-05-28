const express = require("express");
const router = express.Router();
const asyncwrap = require("../utils/asyncwrap");
const { isLoggedIn } = require("../loginauthentication");
const paymentController = require("../controllers/payment");

router.post("/:bookingId/checkout", isLoggedIn, asyncwrap(paymentController.createCheckoutSession));
router.get("/:bookingId/payment/success", isLoggedIn, asyncwrap(paymentController.paymentSuccess));
router.get("/:bookingId/payment/cancel", isLoggedIn, asyncwrap(paymentController.paymentCancel));

module.exports = router;
