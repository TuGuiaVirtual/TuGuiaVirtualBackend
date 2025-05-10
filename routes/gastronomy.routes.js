const express = require('express');
const router = express.Router();
const { getTopVisitedGastronomy, getRestaurants, getTopRestaurantsByCity, getRestaurantsByIds } = require('../controllers/gastronomy.controller');

router.get('/getTopVisitedGastronomy', getTopVisitedGastronomy);
router.get('/getRestaurants', getRestaurants);
router.get('/getTopRestaurantsByCity', getTopRestaurantsByCity);
router.post('/getRestaurantsByIds', getRestaurantsByIds);



module.exports = router;