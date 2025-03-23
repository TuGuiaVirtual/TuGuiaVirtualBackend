const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Registro
router.post('/register', register);

// Login
router.post('/login', login);

// Ruta protegida: obtener datos del usuario logeado
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
});

module.exports = router;
