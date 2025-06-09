const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, refreshToken, logout, verifyEmail } = require('../controllers/auth.controller');
const { loginWithGoogle } = require('../controllers/auth.google.controller');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);
router.post('/refreshToken', refreshToken);
router.post('/logout', logout);


router.post('/google', loginWithGoogle);

module.exports = router;
