const analyticsService = require('../services/analyticsService');

/**
 * GET /api/analytics/dashboard
 * Summary stats for the user's dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const summary = await analyticsService.getDashboardSummary(req.user._id);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/volume/weekly
 * Query params: weeks (default 8)
 */
const getWeeklyVolume = async (req, res, next) => {
  try {
    const { weeks } = req.query;
    const data = await analyticsService.getWeeklyVolume(req.user._id, weeks);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/personal-bests
 * Returns highest weight per exercise for the user
 */
const getPersonalBests = async (req, res, next) => {
  try {
    const data = await analyticsService.getPersonalBests(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/frequency
 * Query params: days (default 30)
 */
const getMuscleGroupFrequency = async (req, res, next) => {
  try {
    const { days } = req.query;
    const data = await analyticsService.getMuscleGroupFrequency(req.user._id, days);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/progress/:exerciseId
 * Progress over time for a specific exercise
 */
const getExerciseProgress = async (req, res, next) => {
  try {
    const data = await analyticsService.getExerciseProgress(
      req.user._id,
      req.params.exerciseId
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getWeeklyVolume,
  getPersonalBests,
  getMuscleGroupFrequency,
  getExerciseProgress,
};
