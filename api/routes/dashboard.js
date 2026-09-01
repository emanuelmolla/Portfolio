const express = require("express");
const { addVisit, getWeeklyVisits, deleteVisit } = require("../controllers/visitController");
const { getStats } = require("../controllers/statsController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/visits", addVisit); // public: record a visit
router.get("/visits", getWeeklyVisits); // public: get  weekly visits
router.delete("/visits/:id", deleteVisit); // public: delete a visit


router.get("/stats", authMiddleware, getStats); // admin only


module.exports = router;
