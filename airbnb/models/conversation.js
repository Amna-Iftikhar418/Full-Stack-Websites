const mongoose = require("mongoose");
const { Schema } = mongoose;

const conversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
    },
    lastMessage: {
        type: String,
        default: "",
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
    },
    unreadBy: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
}, { timestamps: true });

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
