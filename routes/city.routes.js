const express = require('express');
const router = express.Router();
const { getCityNamesByLanguage, getTopVisitedCities } = require('../controllers/city.controller');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.get('/getCitiesLang', getCityNamesByLanguage);
router.get('/getTopVisitedCities', getTopVisitedCities);

module.exports = router;
