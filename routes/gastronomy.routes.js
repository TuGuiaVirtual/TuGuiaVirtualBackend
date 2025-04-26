const express = require('express');
const router = express.Router();
const { getTopVisitedGastronomy, getRestaurants } = require('../controllers/gastronomy.controller');

router.get('/getTopVisitedGastronomy', getTopVisitedGastronomy);
router.get('/getRestaurants', getRestaurants);

module.exports = router;