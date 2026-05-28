const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new Schema({
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending"
    },
    paymentStatus: {
        type: String,
        enum: ["unpaid", "paid", "refunded"],
        default: "unpaid"
    },
    stripeSessionId: {
        type: String,
    },
    paidAt: {
        type: Date,
    },
    totalPrice: {
        type: Number,
        required: true
    },
    priceBreakdown: {
        nights: { type: Number, default: 0 },
        nightlyRate: { type: Number, default: 0 },
        baseAmount: { type: Number, default: 0 },
        discountPercent: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        cleaningFee: { type: Number, default: 0 },
        serviceFee: { type: Number, default: 0 },
        taxes: { type: Number, default: 0 }
    },
    guests: {
        type: Number,
        default: 1,
        min: 1
    },
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    guest: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
