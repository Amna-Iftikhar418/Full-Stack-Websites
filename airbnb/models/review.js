const mongoose = require("mongoose");
const { Schema } = mongoose;
let reviewSchema = new Schema({
    comment: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    cleanliness: { type: Number, min: 1, max: 5 },
    accuracy: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    checkIn: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
    createdAt: {
        type: Date,
        default: () => Date.now()
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("Review", reviewSchema)