const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getProfile, updateProfile, updatePreferences, updatePermissions, getDoc, verifyEmail } = require('../controllers/user.controller');

router.get('/me', verifyToken, getProfile);
router.patch('/updateProfile', verifyToken, updateProfile);
router.patch('/updatePreferences', verifyToken, updatePreferences);
router.patch('/updatePermissions', verifyToken, updatePermissions);
router.get('/getDoc', getDoc);
router.get('/verifyEmail', verifyEmail);

module.exports = router;