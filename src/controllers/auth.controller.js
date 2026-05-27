const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');

const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await User.create({ email, password: hashed, username, email_verified: false, verification_token: verificationToken });
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'Cuenta creada. Revisa tu correo para verificarla.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });

    if (!user.email_verified) return res.status(403).json({ error: 'Verifica tu correo antes de iniciar sesión.' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ where: { verification_token: token } });
    if (!user) return res.status(400).json({ error: 'Token inválido o expirado.' });

    await user.update({ email_verified: true, verification_token: null });

    const jwtToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token: jwtToken, message: 'Correo verificado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    // Siempre respondemos igual para no revelar qué emails existen
    if (!user) return res.json({ message: 'Si existe una cuenta con ese correo, recibirás un enlace.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await user.update({ reset_token: token, reset_token_expires: expires });
    await sendPasswordResetEmail(email, token);

    res.json({ message: 'Si existe una cuenta con ese correo, recibirás un enlace.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: { [Op.gt]: new Date() },
      },
    });
    if (!user) return res.status(400).json({ error: 'Token inválido o expirado.' });

    const hashed = await bcrypt.hash(password, 10);
    await user.update({ password: hashed, reset_token: null, reset_token_expires: null });

    res.json({ message: 'Contraseña actualizada correctamente. Ya puedes acceder.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword };
