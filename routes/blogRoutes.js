const express = require("express");
const router = express.Router();
const {
  getAllBlogs,
  getBlogBySlug,
  addBlog,
  updateBlog
} = require("../controllers/blogController");

router.get("/", getAllBlogs);
router.get("/:slug", getBlogBySlug);

router.put("/:id", updateBlog);

router.post("/", addBlog);

module.exports = router;
