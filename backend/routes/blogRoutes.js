const express = require('express');
const Blog = require('../models/Blog');
const router = express.Router();

// Save draft or update
router.post('/save-draft', async (req, res) => {
  const { id, title, content, tags } = req.body;
  let blog;

  if (id) {
    blog = await Blog.findByIdAndUpdate(
      id,
      { title, content, tags, updated_at: Date.now() },
      { new: true }
    );
  } else {
    blog = new Blog({ title, content, tags });
    await blog.save();
  }

  res.json(blog);
});

// Publish blog
router.post('/publish', async (req, res) => {
  const { id, title, content, tags } = req.body;
  let blog;

  if (id) {
    blog = await Blog.findByIdAndUpdate(
      id,
      { title, content, tags, status: 'published', updated_at: Date.now() },
      { new: true }
    );
  } else {
    blog = new Blog({ title, content, tags, status: 'published' });
    await blog.save();
  }

  res.json(blog);
});

// Get all blogs
router.get('/', async (req, res) => {
  const blogs = await Blog.find();
  res.json(blogs);
});

// Get by ID
router.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.json(blog);
});

module.exports = router;
