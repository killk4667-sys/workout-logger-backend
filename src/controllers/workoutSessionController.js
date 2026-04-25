const { validationResult } = require('express-validator');
const workoutSessionService = require('../services/workoutSessionService');

/**
 * GET /api/sessions
 * Query params: page, limit, startDate, endDate
 */
const getAll = async (req, res, next) => {
  try {
    const { page, limit, startDate, endDate } = req.query;
    const result = await workoutSessionService.getUserSessions(req.user._id, {
      page,
      limit,
      startDate,
      endDate,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sessions/history
 * Returns last N sessions for the user
 */
const getHistory = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const sessions = await workoutSessionService.getWorkoutHistory(req.user._id, limit);
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sessions/:id
 */
const getOne = async (req, res, next) => {
  try {
    const session = await workoutSessionService.getSessionById(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/sessions
 */
const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, date, exercises } = req.body;
    const session = await workoutSessionService.createSession(
      { name, date, exercises },
      req.user._id
    );

    res.status(201).json({
      success: true,
      message: 'Workout session logged successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/sessions/:id
 */
const update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const session = await workoutSessionService.updateSession(
      req.params.id,
      req.user._id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Workout session updated successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/sessions/:id
 */
const remove = async (req, res, next) => {
  try {
    const result = await workoutSessionService.deleteSession(req.params.id, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getOne, getHistory, create, update, remove };
