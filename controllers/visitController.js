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

/**
 * Delete any visits older than 14 full days.
 * (i.e., createdAt < cutoff)
 */
async function deleteVisitsOlderThan14Days() {
  // Cutoff = now minus 14 days
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const { deletedCount } = await Visit.deleteMany({
    createdAt: { $lt: cutoff },
  });

  return { deletedCount, cutoff };
}

/**
 * (Optional) Delete all visits created today (local server time).
 */
async function deleteTodaysVisits() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { deletedCount } = await Visit.deleteMany({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  return { deletedCount, startOfDay, endOfDay };
}



module.exports = {
  deleteVisitsOlderThan14Days,
  deleteTodaysVisits,
  addVisit,
};


