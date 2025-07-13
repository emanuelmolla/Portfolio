const Blog = require("../models/Blog.js");

const slugify = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const addBlog = async (req, res) => {
  const { title, content, image, published, slug } = req.body;
  if (!(title && content && image && published)) {
    return res.json({ Error: "All fields are required" });
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

const updateBlog = async (req, res) => {
  try {
    const id = req.params._id;
    const { likes } = req.body;
    const blog = await Blog.findByIdAndUpdate(id, { likes }, { new: true });
    return res.status(200).json({ blog });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { addBlog, getAllBlogs, getBlogBySlug, updateBlog };
