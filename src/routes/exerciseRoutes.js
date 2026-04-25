const express = require('express');
const { body, query } = require('express-validator');
const exerciseController = require('../controllers/exerciseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'full body', 'other'];

const createValidation = [
  body('name').trim().notEmpty().withMessage('Exercise name is required'),
  body('muscleGroup')
    .notEmpty().withMessage('Muscle group is required')
    .isIn(MUSCLE_GROUPS).withMessage(`Muscle group must be one of: ${MUSCLE_GROUPS.join(', ')}`),
  body('description').optional().isString(),
];

const updateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('muscleGroup').optional().isIn(MUSCLE_GROUPS)
    .withMessage(`Muscle group must be one of: ${MUSCLE_GROUPS.join(', ')}`),
  body('description').optional().isString(),
];

// All routes require authentication
router.use(protect);

// ExerciseDB external API routes (must be before /:id to avoid conflicts)
router.get('/external/search', exerciseController.searchExternal);
router.post('/external/import/:bodyPart', exerciseController.importByBodyPart);

// Muscle group filter route
router.get('/muscle/:muscleGroup', exerciseController.getByMuscleGroup);

// CRUD routes
router.get('/', exerciseController.getAll);
router.post('/', createValidation, exerciseController.create);
router.get('/:id', exerciseController.getOne);
router.put('/:id', updateValidation, exerciseController.update);
router.delete('/:id', exerciseController.remove);

module.exports = router;
