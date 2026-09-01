const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("DB connected fine");
  } catch (err) {
    console.log("Can't connect to DB\n", `Error: ${err.message}`);
  }
};
module.exports = connectDB;
