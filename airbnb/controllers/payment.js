const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/users");
const emailService = require("../utils/email");

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_KEY ? require("stripe")(STRIPE_KEY) : null;

function appUrl(req) {
    return process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
}

module.exports.createCheckoutSession = async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings/guest");
    }

    if (String(booking.guest) !== String(req.user._id)) {
        req.flash("error", "You can only pay for your own booking");
        return res.redirect("/bookings/guest");
    }

    if (booking.paymentStatus === "paid") {
        req.flash("success", "This booking is already paid");
        return res.redirect("/bookings/guest");
    }

    if (booking.status === "cancelled") {
        req.flash("error", "Cannot pay for a cancelled booking");
        return res.redirect("/bookings/guest");
    }

    if (!stripe) {
        // Dev fallback: auto-mark paid
        booking.paymentStatus = "paid";
        booking.status = "confirmed";
        booking.paidAt = new Date();
        booking.stripeSessionId = "dev-" + Date.now();
        await booking.save();

        const guest = await User.findById(booking.guest);
        await emailService.sendPaymentReceipt(guest, booking.listing, booking);

        req.flash("success", "Dev mode: Stripe not configured, booking auto-confirmed.");
        return res.redirect(`/bookings/${booking._id}/payment/success`);
    }

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
            price_data: {
                currency: "usd",
                product_data: {
                    name: booking.listing.title,
                    description: `Booking ${booking.checkIn.toDateString()} → ${booking.checkOut.toDateString()}`,
                },
                unit_amount: Math.round(booking.totalPrice * 100),
            },
            quantity: 1,
        }],
        metadata: {
            bookingId: String(booking._id),
            guestId: String(booking.guest),
        },
        success_url: `${appUrl(req)}/bookings/${booking._id}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl(req)}/bookings/${booking._id}/payment/cancel`,
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    res.redirect(303, session.url);
};

module.exports.paymentSuccess = async (req, res) => {
    const { bookingId } = req.params;
    const { session_id } = req.query;

    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings/guest");
    }

    if (String(booking.guest) !== String(req.user._id)) {
        req.flash("error", "Unauthorized");
        return res.redirect("/bookings/guest");
    }

    // Verify with Stripe if configured
    if (stripe && session_id) {
        try {
            const session = await stripe.checkout.sessions.retrieve(session_id);
            if (session.payment_status === "paid" && booking.paymentStatus !== "paid") {
                booking.paymentStatus = "paid";
                booking.status = "confirmed";
                booking.paidAt = new Date();
                await booking.save();

                const guest = await User.findById(booking.guest);
                await emailService.sendPaymentReceipt(guest, booking.listing, booking);
            }
        } catch (err) {
            console.error("Stripe session retrieve failed:", err.message);
        }
    }

    res.render("bookings/payment-success", { booking });
};

module.exports.stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !webhookSecret) {
        return res.status(200).json({ received: true });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error("Stripe webhook signature failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId;
        if (bookingId && session.payment_status === "paid") {
            try {
                const booking = await Booking.findById(bookingId).populate("listing");
                if (booking && booking.paymentStatus !== "paid") {
                    booking.paymentStatus = "paid";
                    booking.status = "confirmed";
                    booking.paidAt = new Date();
                    await booking.save();

                    const guest = await User.findById(booking.guest);
                    await emailService.sendPaymentReceipt(guest, booking.listing, booking);
                }
            } catch (err) {
                console.error("Webhook booking update failed:", err.message);
            }
        }
    }

    res.json({ received: true });
};

module.exports.paymentCancel = async (req, res) => {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings/guest");
    }
    res.render("bookings/payment-cancel", { booking });
};
