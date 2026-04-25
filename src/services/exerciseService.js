const Exercise = require('../models/Exercise');
const externalApi = require('./externalApiService');

/**
 * Get all exercises — supports text search and muscle group filter
 * Results include both user-created and externally imported exercises
 */
const getAllExercises = async ({ search, muscleGroup, page = 1, limit = 20 } = {}) => {
  const query = {};

  if (muscleGroup) {
    query.muscleGroup = muscleGroup.toLowerCase();
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [exercises, total] = await Promise.all([
    Exercise.find(query)
      .populate('createdBy', 'username')
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit)),
    Exercise.countDocuments(query),
  ]);

  return {
    exercises,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single exercise by ID
 */
const getExerciseById = async (id) => {
  const exercise = await Exercise.findById(id).populate('createdBy', 'username');
  if (!exercise) {
    const error = new Error('Exercise not found');
    error.statusCode = 404;
    throw error;
  }
  return exercise;
};

/**
 * Create a new custom exercise
 */
const createExercise = async ({ name, muscleGroup, description }, userId) => {
  // Check for duplicate name (case-insensitive)
  const existing = await Exercise.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
  if (existing) {
    const error = new Error('An exercise with this name already exists');
    error.statusCode = 400;
    throw error;
  }

  const exercise = await Exercise.create({
    name,
    muscleGroup: muscleGroup.toLowerCase(),
    description,
    isCustom: true,
    createdBy: userId,
  });

  return exercise;
};

/**
 * Update an existing exercise (only creator or admin can update)
 */
const updateExercise = async (id, updates, userId) => {
  const exercise = await Exercise.findById(id);
  if (!exercise) {
    const error = new Error('Exercise not found');
    error.statusCode = 404;
    throw error;
  }

  // Only allow editing custom exercises the user owns
  if (exercise.isCustom && exercise.createdBy?.toString() !== userId.toString()) {
    const error = new Error('Not authorized to edit this exercise');
    error.statusCode = 403;
    throw error;
  }

  const allowedUpdates = ['name', 'muscleGroup', 'description'];
  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      exercise[field] = field === 'muscleGroup' ? updates[field].toLowerCase() : updates[field];
    }
  });

  await exercise.save();
  return exercise;
};

/**
 * Delete an exercise
 */
const deleteExercise = async (id, userId) => {
  const exercise = await Exercise.findById(id);
  if (!exercise) {
    const error = new Error('Exercise not found');
    error.statusCode = 404;
    throw error;
  }

  if (exercise.isCustom && exercise.createdBy?.toString() !== userId.toString()) {
    const error = new Error('Not authorized to delete this exercise');
    error.statusCode = 403;
    throw error;
  }

  await exercise.deleteOne();
  return { message: 'Exercise deleted successfully' };
};

/**
 * Get exercises filtered by muscle group
 */
const getByMuscleGroup = async (muscleGroup) => {
  const exercises = await Exercise.find({
    muscleGroup: muscleGroup.toLowerCase(),
  })
    .populate('createdBy', 'username')
    .sort({ name: 1 });

  return exercises;
};

/**
 * Search ExerciseDB and optionally import results into local DB
 */
const searchExternalAndImport = async (name) => {
  const results = await externalApi.searchExercisesByName(name);

  // Upsert each result into our DB (avoid duplicates by externalId)
  const upserted = await Promise.all(
    results.map((ex) =>
      Exercise.findOneAndUpdate(
        { externalId: ex.externalId },
        { ...ex, isCustom: false },
        { upsert: true, new: true }
      )
    )
  );

  return upserted;
};

/**
 * Import exercises by body part from ExerciseDB
 */
const importByBodyPart = async (bodyPart) => {
  const results = await externalApi.fetchByBodyPart(bodyPart);

  const upserted = await Promise.all(
    results.map((ex) =>
      Exercise.findOneAndUpdate(
        { externalId: ex.externalId },
        { ...ex, isCustom: false },
        { upsert: true, new: true }
      )
    )
  );

  return upserted;
};

module.exports = {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  getByMuscleGroup,
  searchExternalAndImport,
  importByBodyPart,
};
