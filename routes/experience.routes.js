const express = require('express');
const router = express.Router();
const {
    getTopVisitedExperiences,
    getExperiences,
    getTopExperiencesByCity,
    getExperiencesByIds
} = require('../controllers/experience.controller');

router.get('/getTopVisitedExperiences', getTopVisitedExperiences);
router.get('/getExperiences', getExperiences);
router.get('/getTopExperiencesByCity', getTopExperiencesByCity);
router.post('/getExperiencesByIds', getExperiencesByIds);

module.exports = router;