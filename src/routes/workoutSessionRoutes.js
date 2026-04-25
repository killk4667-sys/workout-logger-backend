const express = require('express');
const { body } = require('express-validator');
const workoutSessionController = require('../controllers/workoutSessionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const exerciseEntryValidation = [
  body('exercises').optional().isArray().withMessage('Exercises must be an array'),
  body('exercises.*.exerciseId')
    .notEmpty().withMessage('Each exercise entry must have an exerciseId')
    .isMongoId().withMessage('Invalid exerciseId format'),
  body('exercises.*.sets')
    .notEmpty().withMessage('Sets are required')
    .isInt({ min: 1 }).withMessage('Sets must be a positive integer'),
  body('exercises.*.reps')
    .notEmpty().withMessage('Reps are required')
    .isInt({ min: 1 }).withMessage('Reps must be a positive integer'),
  body('exercises.*.weight')
    .optional()
    .isFloat({ min: 0 }).withMessage('Weight must be a non-negative number'),
];

const createValidation = [
  body('name').optional().trim().isString(),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  ...exerciseEntryValidation,
];

const updateValidation = [
  body('name').optional().trim().isString(),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  ...exerciseEntryValidation,
];

// All routes require authentication
router.use(protect);

// History route (must be before /:id)
router.get('/history', workoutSessionController.getHistory);

// CRUD routes
router.get('/', workoutSessionController.getAll);
router.post('/', createValidation, workoutSessionController.create);
router.get('/:id', workoutSessionController.getOne);
router.put('/:id', updateValidation, workoutSessionController.update);
router.delete('/:id', workoutSessionController.remove);

module.exports = router;
