const WorkoutSession = require('../models/WorkoutSession');
const Exercise = require('../models/Exercise');

/**
 * Get weekly training volume for the last N weeks
 * Volume = weight × reps × sets
 */
const getWeeklyVolume = async (userId, weeks = 8) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const result = await WorkoutSession.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $isoWeekYear: '$date' },
          week: { $isoWeek: '$date' },
        },
        totalVolume: { $sum: '$totalVolume' },
        sessionCount: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        week: '$_id.week',
        totalVolume: 1,
        sessionCount: 1,
        label: {
          $concat: [
            'Week ',
            { $toString: '$_id.week' },
            ' / ',
            { $toString: '$_id.year' },
          ],
        },
      },
    },
  ]);

  return result;
};

/**
 * Detect personal bests: highest weight ever lifted for each exercise
 */
const getPersonalBests = async (userId) => {
  const result = await WorkoutSession.aggregate([
    { $match: { user: userId } },
    { $unwind: '$exercises' },
    {
      $group: {
        _id: '$exercises.exercise',
        maxWeight: { $max: '$exercises.weight' },
        maxVolume: { $max: '$exercises.volume' },
        achievedOn: { $last: '$date' },
      },
    },
    {
      $lookup: {
        from: 'exercises',
        localField: '_id',
        foreignField: '_id',
        as: 'exerciseDetails',
      },
    },
    { $unwind: '$exerciseDetails' },
    {
      $project: {
        _id: 0,
        exerciseId: '$_id',
        exerciseName: '$exerciseDetails.name',
        muscleGroup: '$exerciseDetails.muscleGroup',
        maxWeight: 1,
        maxVolume: 1,
        achievedOn: 1,
      },
    },
    { $sort: { exerciseName: 1 } },
  ]);

  return result;
};

/**
 * Get training frequency per muscle group over a period
 */
const getMuscleGroupFrequency = async (userId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await WorkoutSession.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate },
      },
    },
    { $unwind: '$exercises' },
    {
      $lookup: {
        from: 'exercises',
        localField: 'exercises.exercise',
        foreignField: '_id',
        as: 'exerciseDetails',
      },
    },
    { $unwind: '$exerciseDetails' },
    {
      $group: {
        _id: '$exerciseDetails.muscleGroup',
        frequency: { $sum: 1 },
        totalVolume: { $sum: '$exercises.volume' },
        sessions: { $addToSet: '$_id' },
      },
    },
    {
      $project: {
        _id: 0,
        muscleGroup: '$_id',
        frequency: 1,
        totalVolume: 1,
        uniqueSessions: { $size: '$sessions' },
      },
    },
    { $sort: { frequency: -1 } },
  ]);

  return result;
};

/**
 * Track progress for a specific exercise over time (max weight per session)
 */
const getExerciseProgress = async (userId, exerciseId) => {
  // Validate exercise exists
  const exercise = await Exercise.findById(exerciseId);
  if (!exercise) {
    const error = new Error('Exercise not found');
    error.statusCode = 404;
    throw error;
  }

  const result = await WorkoutSession.aggregate([
    { $match: { user: userId } },
    { $unwind: '$exercises' },
    {
      $match: {
        'exercises.exercise': exercise._id,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' },
        },
        maxWeight: { $max: '$exercises.weight' },
        totalVolume: { $sum: '$exercises.volume' },
        totalSets: { $sum: '$exercises.sets' },
        totalReps: { $sum: '$exercises.reps' },
        date: { $first: '$date' },
      },
    },
    { $sort: { date: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        maxWeight: 1,
        totalVolume: 1,
        totalSets: 1,
        totalReps: 1,
      },
    },
  ]);

  return {
    exercise: {
      id: exercise._id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
    },
    progressData: result,
  };
};

/**
 * Get a summary dashboard for the user
 */
const getDashboardSummary = async (userId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalSessions, recentSessions, totalVolume, uniqueExercises] = await Promise.all([
    WorkoutSession.countDocuments({ user: userId }),
    WorkoutSession.countDocuments({ user: userId, date: { $gte: thirtyDaysAgo } }),
    WorkoutSession.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$totalVolume' } } },
    ]),
    WorkoutSession.aggregate([
      { $match: { user: userId } },
      { $unwind: '$exercises' },
      { $group: { _id: '$exercises.exercise' } },
      { $count: 'total' },
    ]),
  ]);

  return {
    totalSessions,
    sessionsLast30Days: recentSessions,
    totalVolumeLifted: totalVolume[0]?.total || 0,
    uniqueExercisesUsed: uniqueExercises[0]?.total || 0,
  };
};

module.exports = {
  getWeeklyVolume,
  getPersonalBests,
  getMuscleGroupFrequency,
  getExerciseProgress,
  getDashboardSummary,
};
