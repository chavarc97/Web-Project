import asyncHandler from 'express-async-handler';
import Workout from '../models/workoutModel.js';

export const checkWorkoutOwnership = asyncHandler(async (req, res, next) => {
  const workout = await Workout.findById(req.params.id);
  
  if (!workout) {
    return res.status(404).json({
      success: false,
      error: 'Workout not found'
    });
  }

  if (workout.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this workout'
    });
  }

  next();
});

export const checkPlanOwnership = asyncHandler(async (req, res, next) => {
  const plan = await TrainingPlan.findById(req.params.id);
  
  if (!plan) {
    return res.status(404).json({
      success: false,
      error: 'Training plan not found'
    });
  }

  if (plan.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this plan'
    });
  }

  next();
});