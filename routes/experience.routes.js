const express = require('express');
const router = express.Router();
const { getTopVisitedExperiences, getExperiences } = require('../controllers/experience.controller');

router.get('/getTopVisitedExperiences', getTopVisitedExperiences);
router.get('/getExperiences', getExperiences);

module.exports = router;