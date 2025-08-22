const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

const {
  deleteMessage,
  getAllMessages,
  sendMessage,
} = require("../controllers/messageControllers");

router.post("/", sendMessage);

router.get("/", authMiddleware, getAllMessages);

router.delete("/:id", authMiddleware, deleteMessage);

module.exports = router;
