const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./review");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    image: {
        url: String,
        filename: String
    },
    images: [
        {
            url: String,
            filename: String,
        }
    ],
    price: {
        type: Number,
    },
    location: {
        type: String
    },
    country: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    category: {
        type: String,
        enum: [
            "Trending",
            "Farms",
            "Room",
            "Mountain",
            "Amazing Views",
            "Pool",
            "Castles",
            "Beach",
            "Iconic City"
        ],
        default: "Trending"
    },
    date: {
        type: Date,
        default: Date.now
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    cleaningFee: {
        type: Number,
        default: 0,
        min: 0
    },
    weeklyDiscount: {
        type: Number,
        default: 0,
        min: 0,
        max: 50
    },
    monthlyDiscount: {
        type: Number,
        default: 0,
        min: 0,
        max: 50
    },
    minStay: {
        type: Number,
        default: 1,
        min: 1
    },
    maxGuests: {
        type: Number,
        default: 2,
        min: 1
    },
    bedrooms: {
        type: Number,
        default: 1,
        min: 0
    },
    beds: {
        type: Number,
        default: 1,
        min: 0
    },
    bathrooms: {
        type: Number,
        default: 1,
        min: 0
    },
    amenities: {
        type: [String],
        default: []
    }
});

listingSchema.index({ category: 1 });
listingSchema.index({ country: 1 });
listingSchema.index({ price: 1 });

listingSchema.virtual("gallery").get(function () {
    const arr = [];
    if (this.images && this.images.length) {
        this.images.forEach((img) => { if (img && img.url) arr.push(img); });
    }
    if (this.image && this.image.url) {
        const already = arr.some((img) => img.url === this.image.url);
        if (!already) arr.unshift(this.image);
    }
    return arr;
});

listingSchema.set("toJSON", { virtuals: true });
listingSchema.set("toObject", { virtuals: true });

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
