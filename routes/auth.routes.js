const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Registro
router.post('/register', register);

// Login
router.post('/login', login);

module.exports = router;
