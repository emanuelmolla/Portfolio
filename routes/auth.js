const express = require("express");
const { login } = require("../controllers/authControllers");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/login", login);
router.get("/verify", authMiddleware, (req, res) => {
  return res.json({ valid: true, user: req.user });
});

module.exports = router;
