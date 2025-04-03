const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const upload = require('../middleware/multer');
const { uploadImage } = require('../controllers/upload.controller');

router.post('/image', verifyToken, upload.single('file'), uploadImage);

module.exports = router;

