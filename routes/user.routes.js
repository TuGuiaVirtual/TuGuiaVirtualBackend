const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getProfile } = require('../controllers/user.controller');

router.get('/me', verifyToken, getProfile);

module.exports = router;
