const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendEmail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"Tu App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log('✉️ Email enviado:', info.messageId);
  } catch (error) {
    console.error('❌ Error al enviar el email:', error);
    throw error;
  }
};

exports.sendResetEmail = async (to, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Recuperación de contraseña - TuGuíaVirtual',
    text: `Tu código de recuperación es: ${code}. Este código expira en 10 minutos.`
  };

  await transporter.sendMail(mailOptions);
};

exports.sendVerificationEmail = async (to, link) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Verifica tu cuenta - TuGuíaVirtual',
    text: `Gracias por registrarte en TuGuíaVirtual.
    Por favor, haz clic en el siguiente enlace para verificar tu cuenta: ${link}.
    Si no solicitaste esta acción, puedes ignorar este mensaje.`
  };

  await transporter.sendMail(mailOptions);
};



