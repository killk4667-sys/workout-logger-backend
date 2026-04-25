const WorkoutSession = require('../models/WorkoutSession');
const Exercise = require('../models/Exercise');

/**
 * Get all workout sessions for a user (with pagination)
 */
const getUserSessions = async (userId, { page = 1, limit = 10, startDate, endDate } = {}) => {
  const query = { user: userId };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    WorkoutSession.find(query)
      .populate({
        path: 'exercises.exercise',
        select: 'name muscleGroup equipment',
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit)),
    WorkoutSession.countDocuments(query),
  ]);

  return {
    sessions,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single session by ID (user must own it)
 */
const getSessionById = async (sessionId, userId) => {
  const session = await WorkoutSession.findOne({ _id: sessionId, user: userId }).populate({
    path: 'exercises.exercise',
    select: 'name muscleGroup description equipment gifUrl',
  });

  if (!session) {
    const error = new Error('Workout session not found');
    error.statusCode = 404;
    throw error;
  }

  return session;
};

/**
 * Create a new workout session
 * exercises: [{ exerciseId, sets, reps, weight }]
 */
const createSession = async ({ name, date, exercises }, userId) => {
  // Validate all exercise IDs exist
  if (exercises && exercises.length > 0) {
    const ids = exercises.map((e) => e.exerciseId);
    const found = await Exercise.find({ _id: { $in: ids } });
    if (found.length !== ids.length) {
      const error = new Error('One or more exercise IDs are invalid');
      error.statusCode = 400;
      throw error;
    }
  }

  const sessionData = {
    user: userId,
    name: name || 'Workout Session',
    date: date || new Date(),
    exercises: (exercises || []).map((e) => ({
      exercise: e.exerciseId,
      sets: e.sets,
      reps: e.reps,
      weight: e.weight || 0,
    })),
  };

  const session = await WorkoutSession.create(sessionData);
  return session.populate({ path: 'exercises.exercise', select: 'name muscleGroup equipment' });
};

/**
 * Update an existing session
 */
const updateSession = async (sessionId, userId, updates) => {
  const session = await WorkoutSession.findOne({ _id: sessionId, user: userId });
  if (!session) {
    const error = new Error('Workout session not found');
    error.statusCode = 404;
    throw error;
  }

  if (updates.name !== undefined) session.name = updates.name;
  if (updates.date !== undefined) session.date = new Date(updates.date);

  if (updates.exercises !== undefined) {
    // Validate exercise IDs
    const ids = updates.exercises.map((e) => e.exerciseId);
    const found = await Exercise.find({ _id: { $in: ids } });
    if (found.length !== ids.length) {
      const error = new Error('One or more exercise IDs are invalid');
      error.statusCode = 400;
      throw error;
    }

    session.exercises = updates.exercises.map((e) => ({
      exercise: e.exerciseId,
      sets: e.sets,
      reps: e.reps,
      weight: e.weight || 0,
    }));
  }

  await session.save();
  return session.populate({ path: 'exercises.exercise', select: 'name muscleGroup equipment' });
};

/**
 * Delete a session
 */
const deleteSession = async (sessionId, userId) => {
  const session = await WorkoutSession.findOneAndDelete({ _id: sessionId, user: userId });
  if (!session) {
    const error = new Error('Workout session not found');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Workout session deleted successfully' };
};

/**
 * Get workout history — last N sessions for a user
 */
const getWorkoutHistory = async (userId, limit = 20) => {
  const sessions = await WorkoutSession.find({ user: userId })
    .populate({ path: 'exercises.exercise', select: 'name muscleGroup' })
    .sort({ date: -1 })
    .limit(Number(limit));

  return sessions;
};

module.exports = {
  getUserSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getWorkoutHistory,
};
