const axios = require('axios');

const BASE_URL = process.env.EXERCISEDB_BASE_URL || 'https://exercisedb.p.rapidapi.com';
const API_KEY = process.env.EXERCISEDB_API_KEY;

const headers = {
  'X-RapidAPI-Key': API_KEY,
  'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
};

/**
 * Map ExerciseDB body part to our muscleGroup enum
 */
const mapBodyPartToMuscleGroup = (bodyPart) => {
  const mapping = {
    chest: 'chest',
    back: 'back',
    'upper legs': 'legs',
    'lower legs': 'legs',
    shoulders: 'shoulders',
    'upper arms': 'arms',
    'lower arms': 'arms',
    waist: 'core',
    cardio: 'cardio',
    neck: 'other',
  };
  return mapping[bodyPart?.toLowerCase()] || 'other';
};

/**
 * Format an ExerciseDB exercise into our internal format
 */
const formatExercise = (ex) => ({
  name: ex.name,
  muscleGroup: mapBodyPartToMuscleGroup(ex.bodyPart),
  description: `Target: ${ex.target}. Equipment: ${ex.equipment}.`,
  isCustom: false,
  externalId: ex.id,
  equipment: ex.equipment,
  gifUrl: ex.gifUrl,
});

/**
 * Fetch all exercises from ExerciseDB (paginated)
 */
const fetchAllExercises = async (limit = 20, offset = 0) => {
  const response = await axios.get(`${BASE_URL}/exercises`, {
    headers,
    params: { limit, offset },
  });
  return response.data.map(formatExercise);
};

/**
 * Search exercises by name on ExerciseDB
 */
const searchExercisesByName = async (name) => {
  const response = await axios.get(
    `${BASE_URL}/exercises/name/${encodeURIComponent(name)}`,
    { headers }
  );
  return response.data.map(formatExercise);
};

/**
 * Fetch exercises by body part from ExerciseDB
 */
const fetchByBodyPart = async (bodyPart) => {
  const response = await axios.get(
    `${BASE_URL}/exercises/bodyPart/${encodeURIComponent(bodyPart)}`,
    { headers }
  );
  return response.data.map(formatExercise);
};

/**
 * Get all available body parts from ExerciseDB
 */
const fetchBodyPartList = async () => {
  const response = await axios.get(`${BASE_URL}/exercises/bodyPartList`, { headers });
  return response.data;
};

module.exports = {
  fetchAllExercises,
  searchExercisesByName,
  fetchByBodyPart,
  fetchBodyPartList,
  formatExercise,
};
