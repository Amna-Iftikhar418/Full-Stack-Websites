const express = require("express");
const router = express.Router();
const asyncwrap = require("../utils/asyncwrap");
const { isAdmin } = require("../loginauthentication");
const adminController = require("../controllers/admin");

router.use(isAdmin);

router.get("/", asyncwrap(adminController.dashboard));

router.get("/users", asyncwrap(adminController.users));
router.post("/users/:id/toggle-admin", asyncwrap(adminController.toggleAdmin));
router.post("/users/:id/toggle-suspend", asyncwrap(adminController.toggleSuspend));
router.delete("/users/:id", asyncwrap(adminController.deleteUser));

router.get("/listings", asyncwrap(adminController.listings));
router.delete("/listings/:id", asyncwrap(adminController.deleteListing));

router.get("/bookings", asyncwrap(adminController.bookings));

router.get("/reviews", asyncwrap(adminController.reviews));
router.delete("/reviews/:id", asyncwrap(adminController.deleteReview));

module.exports = router;
