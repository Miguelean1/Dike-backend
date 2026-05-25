const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../src/models');

const createUser = async (overrides = {}) => {
  const suffix = Date.now() + Math.random().toString(36).slice(2, 6);
  const hashed = await bcrypt.hash('password123', 10);
  const user = await User.create({
    email: `user_${suffix}@test.com`,
    password: hashed,
    username: `user_${suffix}`,
    email_verified: true,
    ...overrides,
  });
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  return { user, token };
};

const createAdmin = (overrides = {}) =>
  createUser({ role: 'admin', ...overrides });

module.exports = { createUser, createAdmin };
