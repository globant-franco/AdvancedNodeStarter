const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const Blog = mongoose.model("Blog");
//const util = require("util");
const cleanCache = require("../middlewares/cleanCache");

module.exports = (app) => {
  app.get("/api/blogs/:id", requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id,
    });

    res.send(blog);
  });

  //   // Let's promisify this function in order to avoid calling
  // // the callback so we can know the result of reading a redis key
  // // by making client.get return a promise
  // client.get = util.promisify(client.get);

  // const cachedBlogs = await client.get(req.user.id);

  // if (cachedBlogs) {
  //   console.log("serving from cache");
  //   return res.send(JSON.parse(cachedBlogs));
  // }

  // const blogs = await Blog.find({ _user: req.user.id });
  // client.set(req.user.id, JSON.stringify(blogs));
  // console.log("serving from mongodb");

  app.get("/api/blogs", requireLogin, async (req, res) => {
    const blogs = await Blog.find({ _user: req.user.id }).cache({
      key: req.user.id,
    });
    return res.send(blogs);
  });

  app.post("/api/blogs", requireLogin, cleanCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id,
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
