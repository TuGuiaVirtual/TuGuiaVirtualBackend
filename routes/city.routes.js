const express = require('express');
const router = express.Router();
const {
    getCityNamesByLanguage,
    getTopVisitedCities,
    getImageCity,
    getCitiesByIds,
    getCitiesNear
} = require('../controllers/city.controller');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.get('/getCitiesLang', getCityNamesByLanguage);
router.get('/getTopVisitedCities', getTopVisitedCities);
router.get('/getImageCity', getImageCity);
router.post('/getCitiesByIds', getCitiesByIds);
router.get('/getCitiesNear', getCitiesNear);


module.exports = router;
