const express = require("express");
const router = express.Router();
const {getAllBlogs, getBlogByTitle, addBlog} = require("../controllers/blogController")

router.get("/", getAllBlogs);
router.get("/:title", getBlogByTitle);

router.post("/", addBlog)


module.exports = router