const express = require("express");
const router = express.Router();
const {
  getAllBlogs,
  getBlogBySlug,
  addBlog,
} = require("../controllers/blogController");

router.get("/", getAllBlogs);
router.get("/:slug", getBlogBySlug);

router.post("/", addBlog);

module.exports = router;
