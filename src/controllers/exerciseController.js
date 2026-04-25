const { validationResult } = require('express-validator');
const exerciseService = require('../services/exerciseService');

/**
 * GET /api/exercises
 * Query params: search, muscleGroup, page, limit
 */
const getAll = async (req, res, next) => {
  try {
    const { search, muscleGroup, page, limit } = req.query;
    const result = await exerciseService.getAllExercises({ search, muscleGroup, page, limit });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/exercises/:id
 */
const getOne = async (req, res, next) => {
  try {
    const exercise = await exerciseService.getExerciseById(req.params.id);
    res.status(200).json({ success: true, data: exercise });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/exercises
 */
const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, muscleGroup, description } = req.body;
    const exercise = await exerciseService.createExercise(
      { name, muscleGroup, description },
      req.user._id
    );

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      data: exercise,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/exercises/:id
 */
const update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const exercise = await exerciseService.updateExercise(
      req.params.id,
      req.body,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: 'Exercise updated successfully',
      data: exercise,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/exercises/:id
 */
const remove = async (req, res, next) => {
  try {
    const result = await exerciseService.deleteExercise(req.params.id, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/exercises/muscle/:muscleGroup
 */
const getByMuscleGroup = async (req, res, next) => {
  try {
    const exercises = await exerciseService.getByMuscleGroup(req.params.muscleGroup);
    res.status(200).json({ success: true, data: exercises });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/exercises/external/search?name=...
 * Search ExerciseDB and auto-import results
 */
const searchExternal = async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ success: false, message: 'name query param is required' });
    }
    const results = await exerciseService.searchExternalAndImport(name);
    res.status(200).json({
      success: true,
      message: `Found and imported ${results.length} exercises from ExerciseDB`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/exercises/external/import/:bodyPart
 * Bulk-import exercises from ExerciseDB by body part
 */
const importByBodyPart = async (req, res, next) => {
  try {
    const results = await exerciseService.importByBodyPart(req.params.bodyPart);
    res.status(200).json({
      success: true,
      message: `Imported ${results.length} exercises for body part: ${req.params.bodyPart}`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getOne, create, update, remove, getByMuscleGroup, searchExternal, importByBodyPart };
