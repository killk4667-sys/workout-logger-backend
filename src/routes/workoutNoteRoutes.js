const express = require('express');
const { body } = require('express-validator');
const workoutNoteController = require('../controllers/workoutNoteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const contentValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Note content is required')
    .isLength({ max: 1000 }).withMessage('Note cannot exceed 1000 characters'),
];

// All routes require authentication
router.use(protect);

// Session-scoped note routes
router.get('/session/:sessionId', workoutNoteController.getNotesBySession);
router.post('/session/:sessionId', contentValidation, workoutNoteController.addNote);

// Individual note routes
router.get('/:id', workoutNoteController.getOne);
router.put('/:id', contentValidation, workoutNoteController.updateNote);
router.delete('/:id', workoutNoteController.deleteNote);

module.exports = router;
