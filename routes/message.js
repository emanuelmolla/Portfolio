const express = require("express")
const authMiddleware = require("../middlewares/authMiddleware")
const router = express.Router()

const {getAllMessages, sendMessage} = require("../controllers/messageControllers")

router.post("/", sendMessage)

router.get("/", authMiddleware, getAllMessages)