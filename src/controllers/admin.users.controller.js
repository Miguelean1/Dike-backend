'use strict';

const { User } = require('../models');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['registration_date', 'DESC']],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { username, bio, role, reputation } = req.body;
    await user.update({ username, bio, role, reputation });

    const { password, ...data } = user.toJSON();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAllUsers, updateUser, deleteUser };
