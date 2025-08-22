const Visit = require("../models/Visit");
const Message = require("../models/Message");
const Blog = require("../models/Blog"); // make sure you have this

const getStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const prevWeekStart = new Date();
    prevWeekStart.setDate(prevWeekStart.getDate() - 14);

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
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const visitData = visits.map((v) => ({
      date: v._id,
      visits: v.count,
      day: new Date(v._id).toLocaleDateString("en-US", { weekday: "short" }),
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
