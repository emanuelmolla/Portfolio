const Blog = require("../models/Blog.js");

const addBlog = async (req, res) => {};
const getAllBlogs = async (req, res) => {
  res.send("All blogs will be here!");
};

const getBlogByTitle = async (req, res) => {};

module.exports = { addBlog, getAllBlogs, getBlogByTitle };
