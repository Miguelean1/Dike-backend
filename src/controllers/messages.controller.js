const { Op } = require('sequelize');
const { Message, User } = require('../models');

const getConversation = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = parseInt(req.params.userId);

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: myId, receiver_id: otherId },
          { sender_id: otherId, receiver_id: myId },
        ],
      },
      order: [['sent_date', 'ASC']],
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const message = await Message.create({
      sender_id: req.user.id,
      receiver_id,
      content,
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.receiver_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await message.update({ read_status: true });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getConversation, sendMessage, markAsRead };
