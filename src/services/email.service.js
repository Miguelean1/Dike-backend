const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;
  await transporter.sendMail({
    from: `"Dike" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verifica tu cuenta en Dike',
    text: `Hola,\n\nHaz clic en el siguiente enlace para verificar tu cuenta:\n\n${url}\n\nEste enlace expira en 24 horas.\n\nSi no creaste una cuenta en Dike, ignora este mensaje.`,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"Dike" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Restablece tu contraseña en Dike',
    text: `Hola,\n\nHaz clic en el siguiente enlace para restablecer tu contraseña:\n\n${url}\n\nEste enlace expira en 1 hora.\n\nSi no solicitaste este cambio, ignora este mensaje.`,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
