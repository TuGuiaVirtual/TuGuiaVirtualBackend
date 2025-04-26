const express = require('express');
const router = express.Router();
const { getPlaces, getTopPlaceByCity } = require('../controllers/place.controller');

router.get('/getPlaces', getPlaces);
router.get('/getTopPlaceByCity', getTopPlaceByCity);

module.exports = router;
