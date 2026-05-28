const mongoose = require("mongoose");
const passportlocalmongoose = require("passport-local-mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    firstName: {
        type: String,
        default: '',
    },
    lastName: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    bio: {
        type: String,
        default: '',
        maxlength: 500,
    },
    profileImage: {
        url: String,
        filename: String,
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "Listing"
    }],
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isSuspended: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
    },
    verificationTokenExpires: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.plugin(passportlocalmongoose);
module.exports = mongoose.model("User", userSchema);
