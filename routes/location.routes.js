const express = require('express');
const router = express.Router();
const controller = require('../controllers/location.controller');

router.get('/reverse-geocode', controller.getCityFromCoordinates);

module.exports = router;
