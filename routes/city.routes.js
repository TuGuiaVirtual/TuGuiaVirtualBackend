const express = require('express');
const router = express.Router();
const {
    getCityNamesByLanguage,
    getTopVisitedCities,
    getImageCity,
    getCitiesByIds
} = require('../controllers/city.controller');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.get('/getCitiesLang', getCityNamesByLanguage);
router.get('/getTopVisitedCities', getTopVisitedCities);
router.get('/getImageCity', getImageCity);
router.post('/getCitiesByIds', getCitiesByIds);

module.exports = router;
