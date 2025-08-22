const express = require("express");
const router = express.Router();
const {
  getAllBlogs,
  getBlogBySlug,
  addBlog,
  updateBlog,
} = require("../controllers/blogController");

const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", getAllBlogs);
router.get("/:slug", getBlogBySlug);

router.put("/:id", authMiddleware, updateBlog);

router.post("/", authMiddleware, addBlog);

module.exports = router;
