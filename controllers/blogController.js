const Blog = require("../models/Blog.js");

const slugify = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const addBlog = async (req, res) => {
  const { title, content, image, published, slug } = req.body;
  console.log(req.body);
  if (!(title && content && image && published !== undefined)) {
    return res.status(400).json({ Error: "All fields are required" });
  }
  try {
    const newBlog = await Blog.create({
      title,
      content,
      image,
      published,
      slug: slug ? slug : slugify(title),
    });

    return res
      .status(201)
      .json({ message: "Successfully created a blog", data: newBlog });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};
const getAllBlogs = async (req, res) => {
  const blogs = await Blog.find();

  const result = blogs
    .map((blog) => ({
      _id: blog._id,
      title: blog.title,
      image: blog.image,
      likes: blog.likes,
      views: blog.views,
      date: blog.createdAt,
      slug: blog.slug,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return res.status(200).json(result);
};
const getPublicBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true });

    const result = blogs
      .map((blog) => ({
        title: blog.title,
        image: blog.image,
        likes: blog.likes,
        views: blog.views,
        date: blog.createdAt,
        slug: blog.slug,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching public blogs:", err);
    res.status(500).json({ error: "Unable to fetch blogs" });
  }
};

const getBlogBySlug = async (req, res) => {
  const slug = req.params.slug;

  const blog = await Blog.findOneAndUpdate(
    { slug, published: true },
    { $inc: { views: 1 } },
    { new: true } // return the updated document
  );
  return res.status(200).json(blog);
};
const getBlogById = async (req, res) => {
  try {
    const id = req.params.id;
    const blog = await Blog.findById(id);
    return res.status(200).json(blog);
  } catch (err) {
    return res.status(500).json({
      message: "Could not fetch blog information",
      error: err.message,
    });
  }
};

const updateBlogLikes = async (req, res) => {
  try {
    const id = req.params._id;
    const { likes } = req.body;
    const blog = await Blog.findByIdAndUpdate(id, { likes }, { new: true });
    return res.status(200).json({ blog });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, image, published } = req.body;

    // Validate required fields
    if (
      !(
        title &&
        content &&
        content.length > 0 &&
        image &&
        typeof published === "boolean"
      )
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find and update
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        slug: slug.trim(),
        content: content.map((p) => p.trim()).filter((p) => p.length > 0),
        image: image.trim(),
        published,
      },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    return res
      .status(200)
      .json({ message: "Blog updated successfully", blog: updatedBlog });
  } catch (err) {
    console.error("Error updating blog:", err);
    res
      .status(500)
      .json({ error: "Unable to update blog", details: err.message });
  }
};

module.exports = {
  addBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  getPublicBlogs,
  updateBlogLikes,
  getBlogById,
};
