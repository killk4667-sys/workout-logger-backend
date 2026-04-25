const mongoose = require('mongoose');

const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'full body', 'other'];

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
      maxlength: [100, 'Exercise name cannot exceed 100 characters'],
    },
    muscleGroup: {
      type: String,
      required: [true, 'Muscle group is required'],
      enum: {
        values: MUSCLE_GROUPS,
        message: `Muscle group must be one of: ${MUSCLE_GROUPS.join(', ')}`,
      },
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    // true = user-created, false = imported from ExerciseDB
    isCustom: {
      type: Boolean,
      default: true,
    },
    // Reference to user who created (null for external API exercises)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // ExerciseDB API external identifier
    externalId: {
      type: String,
      default: null,
    },
    // Additional data from ExerciseDB
    equipment: {
      type: String,
      default: null,
    },
    gifUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast search and filtering
exerciseSchema.index({ name: 'text', muscleGroup: 1 });
exerciseSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
module.exports.MUSCLE_GROUPS = MUSCLE_GROUPS;
