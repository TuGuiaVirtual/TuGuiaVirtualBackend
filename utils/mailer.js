const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // o usa 'hotmail', 'outlook', etc. o Mailtrap para desarrollo
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendResetEmail = async (to, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Recuperación de contraseña - TuGuíaVirtual',
    text: `Tu código de recuperación es: ${code}. Este código expira en 10 minutos.`
  };

  await transporter.sendMail(mailOptions);
};
