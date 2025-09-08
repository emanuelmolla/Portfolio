const express = require("express");
const router = express.Router();
const {
  deleteVisitsOlderThan14Days,
  deleteTodaysVisits,
} = require("../controllers/visitController");
router.get("/", async (req, res) => {

  await deleteVisitsOlderThan14Days();
  res.status(200).json({ message: "Server is up!" });
});

module.exports = router;
