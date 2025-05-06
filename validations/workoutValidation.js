import Joi from "joi";

// Validación para crear workout
export const createWorkoutSchema = Joi.object({
  workoutName: Joi.string().min(2).max(50).required(),
  user: Joi.string().required(),
  warmUp: Joi.object().optional(),
  work: Joi.array().items(Joi.object()).optional(),
  coolDown: Joi.object().optional(),
});

// Validación para agregar a un plan de entrenamiento
export const addToTrainingPlanSchema = Joi.object({
  date: Joi.date().required(),
  week: Joi.number().required(),
  user: Joi.string().required(),
  workouts: Joi.array().items(
    Joi.object({
      day: Joi.string()
        .valid("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
        .required(),
      workout: Joi.string().required(),
      comment: Joi.array().items(Joi.string().max(250)).optional(),
    })
  ).min(1).required(),
});