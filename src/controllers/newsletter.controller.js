const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendRecommendation = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    await transporter.sendMail({
      from: `"DIKË Plataforma" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Bienvenido a DIKË — Consejos para empezar',
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1c1917;">
          <div style="border-top: 4px solid #1c1917; padding: 32px 0 16px;">
            <h1 style="font-size: 22px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 4px;">DIKË</h1>
            <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #78716c; margin: 0;">Plataforma de préstamos y donaciones</p>
          </div>

          <div style="padding: 24px 0; border-top: 1px solid #e7e5e4;">
            <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 16px;">Cómo sacarle el máximo partido</h2>

            <div style="margin-bottom: 16px;">
              <p style="font-size: 13px; font-weight: 600; margin: 0 0 4px;">1. Explora el feed</p>
              <p style="font-size: 13px; color: #57534e; margin: 0;">Navega por las publicaciones disponibles y filtra por categoría para encontrar lo que necesitas o lo que puedes ofrecer.</p>
            </div>

            <div style="margin-bottom: 16px;">
              <p style="font-size: 13px; font-weight: 600; margin: 0 0 4px;">2. Publica lo que ofreces</p>
              <p style="font-size: 13px; color: #57534e; margin: 0;">Comparte objetos o recursos que tengas disponibles para préstamo o donación. Cuanto más detallada sea la descripción, más solicitudes recibirás.</p>
            </div>

            <div style="margin-bottom: 16px;">
              <p style="font-size: 13px; font-weight: 600; margin: 0 0 4px;">3. Gestiona tus solicitudes</p>
              <p style="font-size: 13px; color: #57534e; margin: 0;">Desde "Mis solicitudes" puedes ver el estado de tus peticiones y las que has recibido. Acepta, rechaza o negocia directamente por mensajes.</p>
            </div>

            <div style="margin-bottom: 16px;">
              <p style="font-size: 13px; font-weight: 600; margin: 0 0 4px;">4. Cuida tu reputación</p>
              <p style="font-size: 13px; color: #57534e; margin: 0;">Las valoraciones son clave. Cumple los acuerdos y deja reseñas honestas para construir una comunidad de confianza.</p>
            </div>
          </div>

          <div style="border-top: 1px solid #e7e5e4; padding: 20px 0 0; font-size: 11px; color: #a8a29e; letter-spacing: 0.05em;">
            Has recibido este correo porque lo solicitaste en dikë.com
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: 'Correo enviado correctamente' });
  } catch (err) {
    console.error('Error enviando email:', err.message);
    res.status(500).json({ error: 'No se pudo enviar el correo' });
  }
};

module.exports = { sendRecommendation };
