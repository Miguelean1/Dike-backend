const { Op } = require('sequelize');
const { Post, User, Tag } = require('../models');

const getPosts = async (req, res) => {
  try {
    const { type, category, status = 'active' } = req.query;
    const where = { status };
    if (type) where.type = type;
    if (category) where.category = category;

    const posts = await Post.findAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'profile_picture'] },
        { model: Tag, through: { attributes: [] } },
      ],
      order: [['creation_date', 'DESC']],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'profile_picture', 'reputation'] },
        { model: Tag, through: { attributes: [] } },
      ],
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, description, category, image, type, tagIds } = req.body;
    const post = await Post.create({
      user_id: req.user.id,
      title,
      description,
      category,
      image,
      type,
    });

    if (tagIds && tagIds.length) await post.setTags(tagIds);

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const { title, description, category, image, type, status, tagIds } = req.body;
    await post.update({ title, description, category, image, type, status });

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
    if (post.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await post.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getPosts, getPost, createPost, updatePost, deletePost };
