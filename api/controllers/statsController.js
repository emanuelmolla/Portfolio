const Visit = require("../models/Visit");
const Message = require("../models/Message");
const Blog = require("../models/Blog"); // make sure you have this

const getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    // last 7 days INCLUDING today in UTC
    const startOfWeek = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6)
    );

    const prevWeekStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 13)
    );

    // Count visits
    const todayVisits = await Visit.countDocuments({
      createdAt: { $gte: startOfToday },
    });
    const weeklyVisits = await Visit.countDocuments({
      createdAt: { $gte: startOfWeek },
    });
    const prevWeekVisits = await Visit.countDocuments({
      createdAt: { $gte: prevWeekStart, $lt: startOfWeek },
    });

    const weeklyChange = prevWeekVisits
      ? (((weeklyVisits - prevWeekVisits) / prevWeekVisits) * 100).toFixed(1)
      : 0;

    // Messages & Blogs
    const totalMessages = await Message.countDocuments();
    const totalBlogs = await Blog.countDocuments();

    // Visits breakdown for chart (last 7 days)
    const visits = await Visit.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const visitData = visits.map((v) => ({
      date: v._id,
      visits: v.count,
    }));

    return res.json({
      stats: {
        todayVisits,
        weeklyVisits,
        totalMessages,
        totalBlogs,
        weeklyChange: parseFloat(weeklyChange),
      },
      visits: visitData,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res
      .status(500)
      .json({ message: "Unable to fetch stats", error: err.message });
  }
};

module.exports = { getStats };
