const Visit = require("../models/Visit");
const geoip = require("geoip-lite");
const axios = require("axios");

const getLocationFromIP = async (ip) => {
  try {
    // Batch endpoint for better performance
    const response = await axios.post("http://ip-api.com/batch", [
      {
        query: ip,
        fields:
          "status,country,countryCode,region,regionName,city,lat,lon,timezone,query",
      },
    ]);

    const result = response.data[0];
    if (result.status === "success") {
      return {
        country: result.countryCode,
        city: result.city,
        region: result.regionName,
        lat: result.lat,
        lon: result.lon,
        timezone: result.timezone,
      };
    }
    return null;
  } catch (error) {
    console.error("IP-API error:", error);
    return null;
  }
};

// Usage in your controller
const addVisit = async (req, res) => {
  try {
    let ip =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.connection?.remoteAddress ||
      req.ip;

    if (ip.startsWith("::ffff:")) {
      ip = ip.replace("::ffff:", "");
    }

    // Skip geolocation for local IPs
    let geo = null;
    if (!isPrivateIP(ip)) {
      geo = await getLocationFromIP(ip);
    }

    await Visit.create({
      ip,
      userAgent: req.headers["user-agent"],
      country: geo ? geo.country : "Unknown",
      city: geo ? geo.city : null,
      date: new Date(),
    });

    return res.status(201).json({ message: "Visit recorded", ip, geo });
  } catch (err) {
    console.error("Error adding visit:", err);
    return res
      .status(500)
      .json({ message: "Unable to record visit", error: err.message });
  }
};

// Helper function to check if IP is private
const isPrivateIP = (ip) => {
  return (
    /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(ip) ||
    ip === "localhost" ||
    ip === "::1"
  );
};

// // Record a new visit
// const addVisit = async (req, res) => {
//   try {
//     // Try to get real IP from headers first
//     let ip =
//       req.headers["x-forwarded-for"]?.split(",")[0].trim() || // from proxy/CDN
//       req.connection?.remoteAddress ||
//       req.socket?.remoteAddress ||
//       req.ip;

//     // Remove IPv6 prefix "::ffff:" if present
//     if (ip.startsWith("::ffff:")) {
//       ip = ip.replace("::ffff:", "");
//     }

//     // Geo lookup
//     const geo = geoip.lookup(ip);

//     await Visit.create({
//       ip,
//       userAgent: req.headers["user-agent"],
//       country: geo ? geo.country : "Unknown",
//       city: geo && geo.city ? geo.city : null,
//       date: new Date(),
//     });

//     return res.status(201).json({ message: "Visit recorded", ip, geo });
//   } catch (err) {
//     console.error("Error adding visit:", err);
//     return res
//       .status(500)
//       .json({ message: "Unable to record visit", error: err.message });
//   }
// };

async function backfillCountries() {
  try {
    // Find visits with no country info
    const visits = await Visit.find({
      $or: [{ country: { $exists: false } }, { country: null }],
    });

    console.log(`Found ${visits.length} visits without country info.`);

    for (const v of visits) {
      const ip = v.ip.includes("::ffff:") ? v.ip.split("::ffff:")[1] : v.ip;
      const geo = geoip.lookup(ip);

      v.country = geo ? geo.country : "Unknown";
      v.city = geo && geo.city ? geo.city : null;

      await v.save();
      console.log(`Updated visit ${v._id} → ${v.country}, ${v.city || "-"}`);
    }

    console.log("Backfill complete ✅");
  } catch (err) {
    console.error("Error backfilling countries:", err);
  }
}

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

const getWeeklyVisits = async (req, res) => {
  try {
    // Get date for 7 days ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Query visits newer than oneWeekAgo
    const visits = await Visit.find({ date: { $gte: oneWeekAgo } })
      .sort({ date: -1 }) // newest first
      .select("ip userAgent country city date"); // only fetch needed fields

    return res.json({
      count: visits.length,
      visits,
    });
  } catch (err) {
    console.error("Error fetching weekly visits:", err);
    return res.status(500).json({ message: "Unable to fetch weekly visits" });
  }
};

const deleteVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Visit.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Visit not found" });
    }
    return res.json({ message: "Visit deleted successfully" });
  } catch (err) {
    console.error("Error deleting visit:", err);
    return res.status(500).json({ message: "Error deleting visit" });
  }
};

module.exports = {
  deleteVisitsOlderThan14Days,
  deleteTodaysVisits,
  addVisit,
  backfillCountries,
  getWeeklyVisits,
  deleteVisit
};
