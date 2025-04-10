const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getProfile, updateProfile, updatePreferences, updatePermissions } = require('../controllers/user.controller');

router.get('/me', verifyToken, getProfile);
router.patch('/updateProfile', verifyToken, updateProfile);
router.patch('/updatePreferences', verifyToken, updatePreferences);
router.patch('/updatePermissions', verifyToken, updatePermissions);

module.exports = router;
