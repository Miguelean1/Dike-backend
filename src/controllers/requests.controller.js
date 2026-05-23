const { Request, Post, User } = require('../models');

const createRequest = async (req, res) => {
  try {
    const { post_id, message, return_date } = req.body;

    const post = await Post.findByPk(post_id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.status !== 'available') return res.status(400).json({ error: 'Post is not available' });
    if (post.user_id === req.user.id) return res.status(400).json({ error: 'Cannot request your own post' });

    const existing = await Request.findOne({ where: { post_id, requester_id: req.user.id } });
    if (existing) return res.status(409).json({ error: 'You already have a request for this post' });

    const request = await Request.create({
      post_id,
      requester_id: req.user.id,
      message,
      return_date: post.type === 'loan' ? return_date : null,
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRequests = async (req, res) => {
  try {
    const { type } = req.query;

    if (type === 'sent') {
      const requests = await Request.findAll({
        where: { requester_id: req.user.id },
        include: [{
          model: Post,
          attributes: ['id', 'title', 'type', 'status'],
          include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
        }],
        order: [['request_date', 'DESC']],
      });
      return res.json(requests);
    }

    if (type === 'received') {
      const requests = await Request.findAll({
        include: [
          { model: Post, where: { user_id: req.user.id }, attributes: ['id', 'title', 'type', 'status'] },
          { model: User, as: 'requester', attributes: ['id', 'username', 'profile_picture'] },
        ],
        order: [['request_date', 'DESC']],
      });
      return res.json(requests);
    }

    const [sent, received] = await Promise.all([
      Request.findAll({
        where: { requester_id: req.user.id },
        include: [{ model: Post, attributes: ['id', 'title', 'type', 'status'] }],
        order: [['request_date', 'DESC']],
      }),
      Request.findAll({
        include: [
          { model: Post, where: { user_id: req.user.id }, attributes: ['id', 'title', 'type', 'status'] },
          { model: User, as: 'requester', attributes: ['id', 'username', 'profile_picture'] },
        ],
        order: [['request_date', 'DESC']],
      }),
    ]);

    res.json({ sent, received });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const respondRequest = async (req, res) => {
  try {
    const { status } = req.body;

    const request = await Request.findByPk(req.params.id, {
      include: [{ model: Post }],
    });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.Post.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Request already resolved' });

    await request.update({ status });

    if (status === 'accepted') {
      const newStatus = request.Post.type === 'loan' ? 'borrowed' : 'reserved';
      await request.Post.update({ status: newStatus });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createRequest, getRequests, respondRequest };
