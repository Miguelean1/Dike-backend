'use strict';

const { Post, User, Tag } = require('../models');

const getAllPosts = async (req, res) => {
  try {
    const { type, category, status } = req.query;
    const where = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;

    const posts = await Post.findAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'username'] },
        { model: Tag, through: { attributes: [] } },
      ],
      order: [['creation_date', 'DESC']],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const { title, description, category, type, status } = req.body;
    const tagIds = req.body.tagIds ? JSON.parse(req.body.tagIds) : null;

    await post.update({ title, description, category, type, status });
    if (tagIds) await post.setTags(tagIds);

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    await post.destroy();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAllPosts, updatePost, deletePost };
