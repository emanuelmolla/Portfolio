const express = require("express");
const { addVisit } = require("../controllers/visitController");
const { getStats } = require("../controllers/statsController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/visits", addVisit); // public: record a visit
router.get("/stats", authMiddleware, getStats); // admin only

module.exports = router;
