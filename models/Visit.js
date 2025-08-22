const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    ip: { type: String }, // optional: track visitor IP
    userAgent: { type: String }, // optional: browser/device info
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Visit = mongoose.model("Visit", visitSchema);

module.exports = Visit;
