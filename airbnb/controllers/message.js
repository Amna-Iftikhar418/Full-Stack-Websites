const mongoose = require("mongoose");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const User = require("../models/users");
const Listing = require("../models/listing");
const emailService = require("../utils/email");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports.inbox = async (req, res) => {
    const conversations = await Conversation.find({ participants: req.user._id })
        .populate("participants", "username email profileImage")
        .populate("listing", "title image images")
        .sort({ lastMessageAt: -1 });

    res.render("messages/inbox", { conversations, currentUserId: String(req.user._id) });
};

module.exports.thread = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        req.flash("error", "Invalid conversation");
        return res.redirect("/inbox");
    }

    const conversation = await Conversation.findById(id)
        .populate("participants", "username email profileImage")
        .populate("listing", "title image images");

    if (!conversation) {
        req.flash("error", "Conversation not found");
        return res.redirect("/inbox");
    }

    const isParticipant = conversation.participants.some(
        (p) => String(p._id) === String(req.user._id)
    );
    if (!isParticipant) {
        req.flash("error", "You are not part of this conversation");
        return res.redirect("/inbox");
    }

    const messages = await Message.find({ conversation: id })
        .populate("sender", "username profileImage")
        .sort({ createdAt: 1 });

    // Mark as read for current user
    conversation.unreadBy = (conversation.unreadBy || []).filter(
        (uid) => String(uid) !== String(req.user._id)
    );
    await conversation.save();

    res.render("messages/thread", {
        conversation,
        messages,
        currentUserId: String(req.user._id),
    });
};

module.exports.startConversation = async (req, res) => {
    const { listingId, recipientId } = req.body;

    if (!isValidId(recipientId)) {
        req.flash("error", "Invalid recipient");
        return res.redirect("/listings");
    }

    if (String(recipientId) === String(req.user._id)) {
        req.flash("error", "You cannot message yourself");
        return res.redirect("back");
    }

    const participants = [req.user._id, recipientId].sort();

    const query = {
        participants: { $all: participants, $size: 2 },
    };
    if (listingId && isValidId(listingId)) {
        query.listing = listingId;
    }

    let conversation = await Conversation.findOne(query);

    if (!conversation) {
        conversation = new Conversation({
            participants,
            listing: listingId && isValidId(listingId) ? listingId : undefined,
        });
        await conversation.save();
    }

    res.redirect(`/inbox/${conversation._id}`);
};

module.exports.sendMessage = async (req, res) => {
    const { id } = req.params;
    const { body } = req.body;

    if (!body || !body.trim()) {
        req.flash("error", "Message cannot be empty");
        return res.redirect(`/inbox/${id}`);
    }

    if (!isValidId(id)) {
        req.flash("error", "Invalid conversation");
        return res.redirect("/inbox");
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) {
        req.flash("error", "Conversation not found");
        return res.redirect("/inbox");
    }

    const isParticipant = conversation.participants.some(
        (p) => String(p) === String(req.user._id)
    );
    if (!isParticipant) {
        req.flash("error", "Not authorized");
        return res.redirect("/inbox");
    }

    const message = new Message({
        conversation: id,
        sender: req.user._id,
        body: body.trim().slice(0, 4000),
    });
    await message.save();

    conversation.lastMessage = message.body.slice(0, 140);
    conversation.lastMessageAt = new Date();
    const others = conversation.participants.filter(
        (p) => String(p) !== String(req.user._id)
    );
    const existingUnread = new Set((conversation.unreadBy || []).map(String));
    others.forEach((uid) => existingUnread.add(String(uid)));
    conversation.unreadBy = Array.from(existingUnread);
    await conversation.save();

    // Notify recipient(s) by email
    try {
        for (const uid of others) {
            const recipient = await User.findById(uid);
            if (recipient) {
                await emailService.sendMessageNotification(recipient, req.user, message.body.slice(0, 200));
            }
        }
    } catch (err) {
        console.error("message notification failed:", err.message);
    }

    res.redirect(`/inbox/${id}`);
};
