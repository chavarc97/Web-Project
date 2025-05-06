import asyncHandler from "express-async-handler";
import Workout from "../models/workoutModel.js";
import TrainingPlan from "../models/planModel.js";
import { errorHandler } from "../middleware/error.js";
import User from "../models/userModel.js";
import { createWorkoutSchema, addToTrainingPlanSchema } from "../validations/workoutValidation.js";

/**
 * @desc    Create a new workout
 * @route   POST /api/training/workout
 * @access  Private
 */
export const createWorkout = asyncHandler(async (req, res, next) => {
  const { workoutName, warmUp, work, coolDown, user, isTemplate } = req.body;

  try {
    // Validate request body against schema
    const { error } = createWorkoutSchema.validate(req.body);
    if (error) {
      return next(errorHandler(400, error.details[0].message));
    }

    // Validate user exists
    const userData = await User.findById(user);
    if (!userData) {
      return next(errorHandler(404, "User not found"));
    }

    // Validate Vdot paces if provided
    if ((warmUp?.pace || coolDown?.pace) && !userData?.vdot?.value) {
      return next(errorHandler(400, "User must have a Vdot value to set paces"));
    }

    // Create workout
    const workout = await Workout.create({
      workoutName,
      warmUp,
      work,
      coolDown,
      user,
      isTemplate: isTemplate || false,
    });

    res.status(201).json({
      success: true,
      message: "Workout created successfully",
      data: workout
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @desc    Get all workouts for a user
 * @route   GET /api/training/workouts/:user
 * @access  Private
 */
export const getAllWorkouts = asyncHandler(async (req, res, next) => {
  const { user } = req.params;
  
  // Check if user is provided
  if (!user) {
    return next(errorHandler(400, "User is required"));
  }
  
  // Check if user exists
  const userExists = await User.findById(user);
  if (!userExists) {
    return next(errorHandler(404, "User not found"));
  }
  
  try {
    const workouts = await Workout.find({ user });
    res.status(200).json({
      success: true,
      count: workouts.length,
      data: workouts
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Get workout by ID
 * @route   GET /api/training/workout/:id/:user
 * @access  Private
 */
export const getWorkoutById = asyncHandler(async (req, res, next) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.params.user
    }).populate('user', 'username avatar');

    if (!workout) {
      return next(errorHandler(404, 'Workout not found'));
    }

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Update a workout
 * @route   PUT /api/training/workout/:id/:user
 * @access  Private
 */
export const updateWorkout = asyncHandler(async (req, res, next) => {
  const { id, user } = req.params;
  
  try {
    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return next(errorHandler(404, "User not found"));
    }
    
    // Check if workout exists and belongs to user
    const existingWorkout = await Workout.findOne({ _id: id, user });
    if (!existingWorkout) {
      return next(errorHandler(404, "Workout not found or unauthorized"));
    }
    
    // Validate Vdot paces if provided
    if ((req.body.warmUp?.pace || req.body.coolDown?.pace) && !userExists?.vdot?.value) {
      return next(errorHandler(400, "User must have a Vdot value to set paces"));
    }
    
    // Update workout
    const workout = await Workout.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.status(200).json({
      success: true,
      message: "Workout updated successfully",
      data: workout
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Delete a workout
 * @route   DELETE /api/training/workout/:id/:user
 * @access  Private
 */
export const deleteWorkout = asyncHandler(async (req, res, next) => {
  const { id, user } = req.params;
  
  try {
    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return next(errorHandler(404, "User not found"));
    }
    
    // Check if workout exists and belongs to user
    const workout = await Workout.findOne({ _id: id, user });
    if (!workout) {
      return next(errorHandler(404, "Workout not found or unauthorized"));
    }
    
    // Delete workout
    await Workout.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Workout deleted successfully",
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Add workout to training plan
 * @route   POST /api/training/plan
 * @access  Private
 */
export const addToTrainingPlan = asyncHandler(async (req, res, next) => {
  try {
    const { date, week, workouts, user } = req.body;
    
    // Validate request body against schema
    const { error } = addToTrainingPlanSchema.validate(req.body);
    if (error) {
      return next(errorHandler(400, error.details[0].message));
    }
    
    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return next(errorHandler(404, "User not found"));
    }
    
    // Calculate total distance
    let calculatedDistance = 0;
    
    // Check if all workouts exist
    for (const workoutItem of workouts) {
      const workout = await Workout.findById(workoutItem.workout);
      if (!workout) {
        return next(errorHandler(404, `Workout ${workoutItem.workout} not found`));
      }
      
      // Add to calculated distance if workout has a virtual totalDistance property
      if (workout.totalDistance) {
        calculatedDistance += workout.totalDistance;
      }
    }
    
    // Create training plan
    const trainingPlan = await TrainingPlan.create({
      workouts,
      date,
      week,
      user,
      totalDistance: calculatedDistance,
    });
    
    // Populate workout details
    const populatedPlan = await TrainingPlan.findById(trainingPlan._id).populate('workouts.workout');
    
    res.status(201).json({
      success: true,
      message: "Training plan created successfully",
      data: populatedPlan
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Get training plans for a user
 * @route   GET /api/training/plans/:user
 * @access  Private
 */
export const getTrainingPlans = asyncHandler(async (req, res, next) => {
  const { user } = req.params;
  
  try {
    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return next(errorHandler(404, "User not found"));
    }
    
    const trainingPlans = await TrainingPlan.find({ user }).populate(
      "workouts.workout"
    );
    
    res.status(200).json({
      success: true,
      count: trainingPlans.length,
      data: trainingPlans
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Get training plan by ID
 * @route   GET /api/training/plan/:id/:user
 * @access  Private
 */
export const getTrainingPlanById = asyncHandler(async (req, res, next) => {
  const { id, user } = req.params;
  
  try {
    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return next(errorHandler(404, "User not found"));
    }
    
    const trainingPlan = await TrainingPlan.findOne({ _id: id, user }).populate(
      "workouts.workout"
    );
    
    if (!trainingPlan) {
      return next(errorHandler(404, "Training plan not found"));
    }
    
    res.status(200).json({
      success: true,
      data: trainingPlan
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Update training plan
 * @route   PUT /api/training/plan/:id/:user
 * @access  Private
 */
export const updateTrainingPlan = asyncHandler(async (req, res, next) => {
  const { id, user } = req.params;
  const { week, workouts } = req.body;
  
  try {
    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return next(errorHandler(404, "User not found"));
    }
    
    // Check if training plan exists and belongs to user
    const existingPlan = await TrainingPlan.findOne({ _id: id, user });
    if (!existingPlan) {
      return next(errorHandler(404, "Training plan not found or unauthorized"));
    }
    
    // Calculate total distance if workouts are being updated
    let calculatedDistance = existingPlan.totalDistance;
    
    if (workouts && Array.isArray(workouts)) {
      calculatedDistance = 0;
      
      // Check if all workouts exist
      for (const workoutItem of workouts) {
        const workout = await Workout.findById(workoutItem.workout);
        if (!workout) {
          return next(errorHandler(404, `Workout ${workoutItem.workout} not found`));
        }
        
        // Add to calculated distance if workout has a virtual totalDistance property
        if (workout.totalDistance) {
          calculatedDistance += workout.totalDistance;
        }
      }
    }
    
    // Update training plan
    const updateData = {
      ...(week && { week }),
      ...(workouts && { workouts }),
      ...(workouts && { totalDistance: calculatedDistance })
    };
    
    const plan = await TrainingPlan.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('workouts.workout');
    
    res.status(200).json({
      success: true,
      message: "Training plan updated successfully",
      data: plan
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Delete training plan
 * @route   DELETE /api/training/plan/:id/:user
 * @access  Private
 */
export const deleteTrainingPlan = asyncHandler(async (req, res, next) => {
  const { id, user } = req.params;
  
  try {
    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return next(errorHandler(404, "User not found"));
    }
    
    // Check if training plan exists and belongs to user
    const plan = await TrainingPlan.findOne({ _id: id, user });
    if (!plan) {
      return next(errorHandler(404, "Training plan not found or unauthorized"));
    }
    
    // Delete training plan
    await TrainingPlan.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Training plan deleted successfully",
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Mark workout as complete in training plan
 * @route   PUT /api/training/plan/complete/:user
 * @access  Private
 */
export const completeWorkout = asyncHandler(async (req, res, next) => {
  const { planId, workoutId, actualDistance, notes } = req.body;
  const { user } = req.params;
  
  try {
    // Validate required fields
    if (!planId || !workoutId) {
      return next(errorHandler(400, "Plan ID and workout ID are required"));
    }
    
    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return next(errorHandler(404, "User not found"));
    }
    
    // Find the training plan
    const plan = await TrainingPlan.findOne({
      _id: planId,
      user
    });
    
    if (!plan) {
      return next(errorHandler(404, "Training plan not found"));
    }
    
    // Find the workout within the plan
    const workoutIndex = plan.workouts.findIndex(
      w => w.workout.toString() === workoutId
    );
    
    if (workoutIndex === -1) {
      return next(errorHandler(404, "Workout not found in plan"));
    }
    
    // Mark as complete
    plan.workouts[workoutIndex].completed = true;
    plan.workouts[workoutIndex].completedAt = new Date();
    
    // Update actual distance if provided
    if (actualDistance !== undefined) {
      plan.workouts[workoutIndex].actualDistance = actualDistance;
    }
    
    // Update notes if provided
    if (notes) {
      plan.workouts[workoutIndex].notes = notes;
    }
    
    // Update completed distance
    plan.completedDistance = plan.workouts
      .filter(w => w.completed)
      .reduce((sum, w) => sum + (w.actualDistance || 0), 0);
    
    // Save changes
    await plan.save();
    
    // Return updated plan with populated workouts
    const updatedPlan = await TrainingPlan.findById(plan._id).populate('workouts.workout');
    
    res.status(200).json({
      success: true,
      message: "Workout marked as complete",
      data: updatedPlan
    });
  } catch (error) {
    next(error);
  }
});