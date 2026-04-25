const WorkoutNote = require('../models/WorkoutNote');
const WorkoutSession = require('../models/WorkoutSession');
const axios = require('axios'); // <-- ADD THIS

/**
 * Verify that the session exists and belongs to the user
 */
const verifySessionOwnership = async (sessionId, userId) => {
  const session = await WorkoutSession.findOne({ _id: sessionId, user: userId });
  if (!session) {
    const error = new Error('Workout session not found or not accessible');
    error.statusCode = 404;
    throw error;
  }
  return session;
};

/**
 * Get all notes for a specific session
 */
const getNotesBySession = async (sessionId, userId) => {
  await verifySessionOwnership(sessionId, userId);

  const notes = await WorkoutNote.find({ session: sessionId, user: userId }).sort({
    createdAt: -1,
  });

  return notes;
};

/**
 * Get a single note by ID
 */
const getNoteById = async (noteId, userId) => {
  const note = await WorkoutNote.findOne({ _id: noteId, user: userId });
  if (!note) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }
  return note;
};

/**
 * Add a note to a workout session
 */
const addNote = async (sessionId, userId, content) => {
  await verifySessionOwnership(sessionId, userId);

  // Use the external API to clean the text
  const cleanContent = await filterProfanity(content);

  const note = await WorkoutNote.create({
    session: sessionId,
    user: userId,
    content: cleanContent, // Save the clean text!
  });

  return note;
};

/**
 * Edit an existing note
 */
const updateNote = async (noteId, userId, content) => {
  const note = await WorkoutNote.findOne({ _id: noteId, user: userId });
  if (!note) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }

  note.content = content;
  await note.save();
  return note;
};

/**
 * Delete a note
 */
const deleteNote = async (noteId, userId) => {
  const note = await WorkoutNote.findOneAndDelete({ _id: noteId, user: userId });
  if (!note) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Note deleted successfully' };
};


const filterProfanity = async (text) => {
  try {
    const res = await axios.get(`https://www.purgomalum.com/service/plain?text=${encodeURIComponent(text)}`);
    return res.data; // Returns the text with bad words replaced by ***
  } catch (err) {
    return text; // If API fails, just return original text
  }
};


module.exports = {
  getNotesBySession,
  getNoteById,
  addNote,
  updateNote,
  deleteNote,
};
