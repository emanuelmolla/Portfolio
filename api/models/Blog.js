const mongoose = require("mongoose");
const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    content: [String],
    slug: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
     
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);
