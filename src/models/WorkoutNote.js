const mongoose = require('mongoose');

const workoutNoteSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutSession',
      required: [true, 'Session reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
      minlength: [1, 'Note cannot be empty'],
      maxlength: [1000, 'Note cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup by session
workoutNoteSchema.index({ session: 1, user: 1 });

module.exports = mongoose.model('WorkoutNote', workoutNoteSchema);
