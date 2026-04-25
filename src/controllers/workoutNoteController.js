const { validationResult } = require('express-validator');
const workoutNoteService = require('../services/workoutNoteService');

/**
 * GET /api/notes/session/:sessionId
 * Get all notes for a specific session
 */
const getNotesBySession = async (req, res, next) => {
  try {
    const notes = await workoutNoteService.getNotesBySession(
      req.params.sessionId,
      req.user._id
    );
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notes/:id
 * Get a single note by its ID
 */
const getOne = async (req, res, next) => {
  try {
    const note = await workoutNoteService.getNoteById(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/notes/session/:sessionId
 * Add a note to a session
 */
const addNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const note = await workoutNoteService.addNote(
      req.params.sessionId,
      req.user._id,
      req.body.content
    );

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notes/:id
 * Edit an existing note
 */
const updateNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const note = await workoutNoteService.updateNote(
      req.params.id,
      req.user._id,
      req.body.content
    );

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notes/:id
 * Delete a note
 */
const deleteNote = async (req, res, next) => {
  try {
    const result = await workoutNoteService.deleteNote(req.params.id, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotesBySession, getOne, addNote, updateNote, deleteNote };
