const mongoose = require('mongoose');

// Sub-schema for each exercise entry in a session
const sessionExerciseSchema = new mongoose.Schema(
  {
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: [true, 'Exercise reference is required'],
    },
    sets: {
      type: Number,
      required: [true, 'Number of sets is required'],
      min: [1, 'Sets must be at least 1'],
    },
    reps: {
      type: Number,
      required: [true, 'Number of reps is required'],
      min: [1, 'Reps must be at least 1'],
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [0, 'Weight cannot be negative'],
      default: 0, // 0 = bodyweight
    },
    // Computed: weight * reps * sets (stored for analytics performance)
    volume: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

// Auto-compute volume before saving the sub-doc
sessionExerciseSchema.pre('save', function (next) {
  this.volume = this.weight * this.reps * this.sets;
  next();
});

const workoutSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Session name cannot exceed 100 characters'],
      default: 'Workout Session',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    exercises: {
      type: [sessionExerciseSchema],
      default: [],
    },
    // Total volume for the whole session (sum of all exercise volumes)
    totalVolume: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate total volume before saving
workoutSessionSchema.pre('save', function (next) {
  this.exercises.forEach((ex) => {
    ex.volume = ex.weight * ex.reps * ex.sets;
  });
  this.totalVolume = this.exercises.reduce((sum, ex) => sum + ex.volume, 0);
  next();
});

// Index for efficient user queries
workoutSessionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('WorkoutSession', workoutSessionSchema);
