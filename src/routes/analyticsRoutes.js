const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard summary
router.get('/dashboard', analyticsController.getDashboard);

// Weekly training volume
router.get('/volume/weekly', analyticsController.getWeeklyVolume);

// Personal bests (max weight per exercise)
router.get('/personal-bests', analyticsController.getPersonalBests);

// Muscle group training frequency
router.get('/frequency', analyticsController.getMuscleGroupFrequency);

// Progress over time for a specific exercise
router.get('/progress/:exerciseId', analyticsController.getExerciseProgress);

module.exports = router;
