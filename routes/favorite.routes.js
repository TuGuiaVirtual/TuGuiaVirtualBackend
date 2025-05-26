const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { toggleFavorite, getFavorites, addView } = require('../controllers/favorite.controller');

router.post('/toggle', verifyToken, toggleFavorite);
router.get('/list', verifyToken, getFavorites);
router.post('/addView', addView);


module.exports = router;