const Joi = require('joi');


const ALLOWED_AMENITIES = [
    "wifi", "kitchen", "parking", "pool", "ac", "heating",
    "washer", "tv", "workspace", "pets", "gym", "breakfast"
];

module.exports.ALLOWED_AMENITIES = ALLOWED_AMENITIES;

module.exports.listingSchema = Joi.object({
    title: Joi.string().required().max(150),
    description: Joi.string().required().max(3000),
    price: Joi.number().required().positive().max(100000),
    country: Joi.string().required().max(100),
    location: Joi.string().required().max(200),
    date: Joi.date().optional().allow(null, ''),

    category: Joi.string().required(),
    cleaningFee: Joi.number().min(0).max(100000).optional().allow('', null),
    weeklyDiscount: Joi.number().min(0).max(50).optional().allow('', null),
    monthlyDiscount: Joi.number().min(0).max(50).optional().allow('', null),
    minStay: Joi.number().integer().min(1).max(365).optional().allow('', null),
    maxGuests: Joi.number().integer().min(1).max(50).optional().allow('', null),
    bedrooms: Joi.number().integer().min(0).max(50).optional().allow('', null),
    beds: Joi.number().integer().min(0).max(50).optional().allow('', null),
    bathrooms: Joi.number().min(0).max(50).optional().allow('', null),
    amenities: Joi.alternatives().try(
        Joi.array().items(Joi.string().valid(...ALLOWED_AMENITIES)),
        Joi.string().valid(...ALLOWED_AMENITIES)
    ).optional(),
    image: Joi.object({
        url: Joi.string().allow(""),
        filename: Joi.string().allow("")
    }).allow(null)
});

module.exports.reviewSchema = Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required().max(1000),
    cleanliness: Joi.number().min(1).max(5).optional().allow('', null),
    accuracy: Joi.number().min(1).max(5).optional().allow('', null),
    location: Joi.number().min(1).max(5).optional().allow('', null),
    communication: Joi.number().min(1).max(5).optional().allow('', null),
    checkIn: Joi.number().min(1).max(5).optional().allow('', null),
    value: Joi.number().min(1).max(5).optional().allow('', null)
})

module.exports.bookingSchema = Joi.object({
    checkIn: Joi.date().required().min('now'),
    checkOut: Joi.date().required().greater(Joi.ref("checkIn")),
    guests: Joi.number().required().min(1).max(100)
});