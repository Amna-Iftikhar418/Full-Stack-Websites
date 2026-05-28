const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/users");
const ExpressError = require("../utils/ExpressError");
const emailService = require("../utils/email");
const { computePriceBreakdown } = require("../utils/pricing");

// Render booking form for a listing
module.exports.renderBookingForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    if (listing.isAvailable === false) {
        req.flash("error", "This listing is currently unavailable for booking");
        return res.redirect(`/listings/${id}`);
    }
    res.render("bookings/new", { listing });
};

// Create a new booking
module.exports.createBooking = async (req, res, next) => {
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    if (listing.isAvailable === false) {
        req.flash("error", "This listing is currently unavailable for booking");
        return res.redirect(`/listings/${id}`);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
        req.flash("error", "Check-out date must be after check-in date");
        return res.redirect(`/listings/${id}/bookings/new`);
    }

    const minStay = listing.minStay || 1;
    if (nights < minStay) {
        req.flash("error", `This listing requires a minimum stay of ${minStay} night(s).`);
        return res.redirect(`/listings/${id}/bookings/new`);
    }

    const guestCount = parseInt(guests, 10) || 1;
    if (listing.maxGuests && guestCount > listing.maxGuests) {
        req.flash("error", `This listing allows a maximum of ${listing.maxGuests} guest(s).`);
        return res.redirect(`/listings/${id}/bookings/new`);
    }

    // Conflict detection: check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
        listing: id,
        status: { $ne: "cancelled" },
        $or: [
            {
                checkIn: { $lt: checkOutDate },
                checkOut: { $gt: checkInDate }
            }
        ]
    });

    if (overlappingBooking) {
        req.flash("error", "This listing is already booked for the selected dates. Please choose different dates.");
        return res.redirect(`/listings/${id}/bookings/new`);
    }

    const breakdown = computePriceBreakdown(listing, nights);

    const booking = new Booking({
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guestCount,
        status: "pending",
        totalPrice: breakdown.total,
        priceBreakdown: {
            nights: breakdown.nights,
            nightlyRate: breakdown.nightlyRate,
            baseAmount: breakdown.baseAmount,
            discountPercent: breakdown.discountPercent,
            discountAmount: breakdown.discountAmount,
            cleaningFee: breakdown.cleaningFee,
            serviceFee: breakdown.serviceFee,
            taxes: breakdown.taxes
        },
        listing: listing._id,
        guest: req.user._id
    });

    await booking.save();

    listing.isAvailable = false;
    await listing.save();

    // Notify host by email
    try {
        const owner = await User.findById(listing.owner);
        if (owner) {
            await emailService.sendBookingRequestToHost(owner, req.user, listing, booking);
        }
    } catch (err) {
        console.error("host notification failed:", err.message);
    }

    req.flash("success", "Booking request sent! Proceed to payment below.");
    res.redirect(`/bookings/guest`);
};

async function refreshListingAvailability(listingId) {
    const activeBookings = await Booking.countDocuments({
        listing: listingId,
        status: { $ne: "cancelled" }
    });
    if (activeBookings === 0) {
        await Listing.findByIdAndUpdate(listingId, { isAvailable: true });
    }
}

// Guest dashboard: view all bookings made by the current user
module.exports.guestDashboard = async (req, res) => {
    const bookings = await Booking.find({ guest: req.user._id })
        .populate("listing")
        .sort({ createdAt: -1 });

    res.render("bookings/guest-dashboard", { bookings });
};

// Host dashboard: view all bookings for listings owned by the current user
module.exports.hostDashboard = async (req, res) => {
    const listings = await Listing.find({ owner: req.user._id });
    const listingIds = listings.map(l => l._id);

    const bookings = await Booking.find({ listing: { $in: listingIds } })
        .populate("listing")
        .populate("guest")
        .sort({ createdAt: -1 });

    res.render("bookings/host-dashboard", { bookings });
};

// Update booking status (confirm/cancel)
module.exports.updateBookingStatus = async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings/host");
    }

    // Only the listing owner can update booking status
    if (String(booking.listing.owner) !== String(req.user._id)) {
        req.flash("error", "You are not authorized to update this booking");
        return res.redirect("/bookings/host");
    }

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
        req.flash("error", "Invalid status");
        return res.redirect("/bookings/host");
    }

    booking.status = status;
    await booking.save();

    if (status === "cancelled") {
        await refreshListingAvailability(booking.listing._id);
    } else {
        await Listing.findByIdAndUpdate(booking.listing._id, { isAvailable: false });
    }

    try {
        const guest = await User.findById(booking.guest);
        if (guest) {
            await emailService.sendBookingStatusToGuest(guest, booking.listing, booking);
        }
    } catch (err) {
        console.error("guest notification failed:", err.message);
    }

    req.flash("success", `Booking ${status} successfully`);
    res.redirect("/bookings/host");
};

// Cancel a booking (guest can cancel their own booking)
module.exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings/guest");
    }

    if (String(booking.guest) !== String(req.user._id)) {
        req.flash("error", "You are not authorized to cancel this booking");
        return res.redirect("/bookings/guest");
    }

    booking.status = "cancelled";
    await booking.save();

    await refreshListingAvailability(booking.listing);

    req.flash("success", "Booking cancelled successfully");
    res.redirect("/bookings/guest");
};

// Check availability for a listing (AJAX endpoint)
module.exports.checkAvailability = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
        return res.status(400).json({ available: false, message: "checkIn and checkOut dates are required" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const overlappingBooking = await Booking.findOne({
        listing: id,
        status: { $ne: "cancelled" },
        $or: [
            {
                checkIn: { $lt: checkOutDate },
                checkOut: { $gt: checkInDate }
            }
        ]
    });

    if (overlappingBooking) {
        return res.status(200).json({ available: false, message: "Dates are not available" });
    }

    return res.status(200).json({ available: true, message: "Dates are available" });
};

// Return a price quote for given dates (AJAX)
module.exports.getQuote = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
        return res.status(400).json({ error: "checkIn and checkOut required" });
    }

    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const a = new Date(checkIn);
    const b = new Date(checkOut);
    const nights = Math.ceil((b - a) / (1000 * 60 * 60 * 24));
    if (isNaN(nights) || nights <= 0) {
        return res.status(400).json({ error: "Invalid date range" });
    }

    const breakdown = computePriceBreakdown(listing, nights);
    res.json(breakdown);
};

// Get booked dates for a listing (for calendar display)
module.exports.getBookedDates = async (req, res) => {
    const { id } = req.params;

    const bookings = await Booking.find({
        listing: id,
        status: { $ne: "cancelled" }
    }).select("checkIn checkOut");

    const bookedDates = [];
    bookings.forEach(booking => {
        let currentDate = new Date(booking.checkIn);
        const endDate = new Date(booking.checkOut);
        while (currentDate < endDate) {
            bookedDates.push(currentDate.toISOString().split("T")[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });

    res.json({ bookedDates });
};
