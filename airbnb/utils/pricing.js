// Price breakdown for a booking.
// Applies weekly/monthly discounts, cleaning fee, service fee, and taxes.
const SERVICE_FEE_RATE = 0.12;
const TAX_RATE = 0.08;

function round2(n) {
    return Math.round(n * 100) / 100;
}

function computePriceBreakdown(listing, nights) {
    const nightlyRate = Number(listing.price) || 0;
    const baseAmount = nightlyRate * nights;

    let discountPercent = 0;
    if (nights >= 28 && listing.monthlyDiscount > 0) {
        discountPercent = listing.monthlyDiscount;
    } else if (nights >= 7 && listing.weeklyDiscount > 0) {
        discountPercent = listing.weeklyDiscount;
    }
    const discountAmount = round2((baseAmount * discountPercent) / 100);

    const cleaningFee = Number(listing.cleaningFee) || 0;
    const subtotal = baseAmount - discountAmount + cleaningFee;
    const serviceFee = round2(subtotal * SERVICE_FEE_RATE);
    const taxes = round2(subtotal * TAX_RATE);
    const total = round2(subtotal + serviceFee + taxes);

    return {
        nights,
        nightlyRate,
        baseAmount: round2(baseAmount),
        discountPercent,
        discountAmount,
        cleaningFee,
        serviceFee,
        taxes,
        total
    };
}

module.exports = { computePriceBreakdown, SERVICE_FEE_RATE, TAX_RATE };
