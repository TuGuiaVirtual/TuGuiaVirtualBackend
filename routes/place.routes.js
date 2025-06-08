const express = require('express');
const router = express.Router();
const { getPlaces, getTopPlaceByCity, getPlacesByIds, getPlaceNear } = require('../controllers/place.controller');
const verifyToken = require('../middleware/auth');

router.get('/getPlaces', getPlaces);
router.get('/getTopPlaceByCity', getTopPlaceByCity);
router.post('/getPlacesByIds', getPlacesByIds);
router.get('/getPlaceNear', getPlaceNear);


module.exports = router;
