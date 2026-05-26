const { User, Post } = require('../models');

const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== parseInt(id)) return res.status(403).json({ error: 'Forbidden' });

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { username, bio } = req.body;
    const profile_picture = req.cloudinaryUrl || req.body.profile_picture || user.profile_picture;
    await user.update({ username, bio, profile_picture });

    const { password, ...data } = user.toJSON();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { user_id: req.params.id },
      order: [['creation_date', 'DESC']],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getUser, updateUser, getUserPosts };
