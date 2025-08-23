const express = require("express");
const router = express.Router();
const {
  getAllBlogs,
  getBlogBySlug,
  addBlog,
  updateBlog,
  updateBlogLikes,
  getPublicBlogs,
  getBlogById,
} = require("../controllers/blogController");

const authMiddleware = require("../middlewares/authMiddleware");

//Public routes

router.get("/public", getPublicBlogs);
router.get("/slug/:slug", getBlogBySlug);
router.patch("/:id/likes", updateBlogLikes);


router.get("/", authMiddleware, getAllBlogs);
router.get("/:id/", authMiddleware, getBlogById);
router.put("/:id", authMiddleware, updateBlog);
router.post("/", authMiddleware, addBlog);

module.exports = router;
