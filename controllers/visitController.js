const Visit = require("../models/Visit");

// Record a new visit
const addVisit = async (req, res) => {
  try {
    await Visit.create({
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json({ message: "Visit recorded" });
  } catch (err) {
    console.error("Error adding visit:", err);
    return res
      .status(500)
      .json({ message: "Unable to record visit", error: err.message });
  }
};

module.exports = { addVisit };
