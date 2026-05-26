const { Post, User, Tag } = require('../models');

const getPosts = async (req, res) => {
  try {
    const { type, category, status = 'available', page = 1, limit = 12 } = req.query;
    const where = { status };
    if (type) where.type = type;
    if (category) where.category = category;

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (parsedPage - 1) * parsedLimit;

    const { count, rows } = await Post.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'profile_picture'] },
        { model: Tag, through: { attributes: [] } },
      ],
      order: [['creation_date', 'DESC']],
      limit: parsedLimit,
      offset,
      distinct: true,
    });

    res.json({
      posts: rows,
      total: count,
      page: parsedPage,
      totalPages: Math.ceil(count / parsedLimit),
    });
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
    const { title, description, category, type } = req.body;
    const tagIds = req.body.tagIds ? JSON.parse(req.body.tagIds) : [];
    const image = req.cloudinaryUrl || req.body.image || null;

    const post = await Post.create({
      user_id: req.user.id,
      title,
      description,
      category,
      image,
      type,
    });

    if (tagIds.length) await post.setTags(tagIds);

    res.status(201).json(post);
  } catch (err) {
    console.error('[CREATE POST ERROR]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const { title, description, category, type, status } = req.body;
    const tagIds = req.body.tagIds ? JSON.parse(req.body.tagIds) : null;
    const image = req.cloudinaryUrl || req.body.image || post.image;

    await post.update({ title, description, category, image, type, status });

    if (tagIds) await post.setTags(tagIds);

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updatePostStatus = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const { status } = req.body;
    await post.update({ status });
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

module.exports = { getPosts, getPost, createPost, updatePost, updatePostStatus, deletePost };
