const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const client = new OAuth2Client();
const prisma = new PrismaClient();

exports.loginWithGoogle = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID_OAUTH_GOOGLE,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const { email, name, sub: googleId } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          provider: 'GOOGLE',
          providerId: googleId,
          password: null,
        },
      });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ message: 'Login con Google exitoso', accessToken });

  } catch (err) {
    console.error('Error verificando token de Google:', err);
    res.status(401).json({ message: 'Token inválido' });
  }
};

