const express = require('express');
const router = express.Router();
const { getPlaces, getTopPlaceByCity, getPlacesByIds } = require('../controllers/place.controller');
const verifyToken = require('../middleware/auth');

router.get('/getPlaces', getPlaces);
router.get('/getTopPlaceByCity', getTopPlaceByCity);
router.post('/getPlacesByIds', getPlacesByIds);

module.exports = router;
