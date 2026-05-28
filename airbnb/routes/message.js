const express = require("express");
const router = express.Router();
const asyncwrap = require("../utils/asyncwrap");
const { isLoggedIn } = require("../loginauthentication");
const messageController = require("../controllers/message");

router.get("/", isLoggedIn, asyncwrap(messageController.inbox));
router.post("/start", isLoggedIn, asyncwrap(messageController.startConversation));
router.get("/:id", isLoggedIn, asyncwrap(messageController.thread));
router.post("/:id/messages", isLoggedIn, asyncwrap(messageController.sendMessage));

module.exports = router;
