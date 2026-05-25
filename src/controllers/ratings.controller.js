const { Rating, User } = require('../models');

const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      where: { rated_user_id: req.params.userId },
      include: [{ model: User, as: 'ratingUser', attributes: ['id', 'username'] }],
      order: [['rating_date', 'DESC']],
    });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createRating = async (req, res) => {
  try {
    const { rated_user_id, post_id, score, comment } = req.body;

    if (rated_user_id === req.user.id) return res.status(400).json({ error: 'Cannot rate yourself' });
    if (score < 1 || score > 5) return res.status(400).json({ error: 'Score must be between 1 and 5' });

    const existing = await Rating.findOne({ where: { rated_user_id, rating_user_id: req.user.id } });
    if (existing) return res.status(409).json({ error: 'Ya has valorado a este usuario.' });

    const rating = await Rating.create({
      rated_user_id,
      rating_user_id: req.user.id,
      post_id,
      score,
      comment,
    });
    res.status(201).json(rating);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getUserRatings, createRating };
