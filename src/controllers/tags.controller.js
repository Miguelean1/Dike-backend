const { Tag } = require('../models');

const getTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({ order: [['name', 'ASC']] });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await Tag.create({ name });
    res.status(201).json(tag);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getTags, createTag };
