const Blog = require("../models/Blog.js");

const slugify = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const addBlog = async (req, res) => {
  const { title, content, image, published } = req.body;
  if (!(title && content && image && published)) {
    return res.json({ Error: "All fields are required" });
  }
  try {
    const newBlog = await Blog.create({
      title,
      content,
      image,
      published,
      slug: slugify(title),
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

  const result = blogs.map((blog) => {
    (title = blog.title),
      (content = blog.content[0]),
      (image = blog.image),
      (slug = blog.slug);

    return { title, content, image, slug };
  });

  return res.status(200).json(result);
};

const getBlogByTitle = async (req, res) => {
  const slug = req.params.title;

  const blog = await Blog.findOne({ slug: slug });
  return res.status(200).json(blog);
};

module.exports = { addBlog, getAllBlogs, getBlogByTitle };
