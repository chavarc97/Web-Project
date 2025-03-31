import asyncHandler from "express-async-handler";
import Workout from "../models/workoutModel.js";
import TrainingPlan from "../models/planModel.js";
import { errorHandler } from "../middleware/error.js";
import User from "../models/userModel.js";

export const createWorkout = asyncHandler(async (req, res, next) => {
  const { workoutName, warmUp, work, coolDown, user, isTemplate } = req.body;

  // Validate Vdot paces
  if(warmUp?.pace || coolDown?.pace) {
    const userData = await User.findById(user);
    if (!userData?.vdot?.value) {
      return errorHandler(400, "User Must have a Vdot value to set paces");
    }
  }

  try {
    const workout = await Workout.create({
      workoutName,
      warmUp,
      work,
      coolDown,
      user,
      isTemplate,
    });
  } catch (error) {
    return next(error);
  }
});

export const addToTrainingPlan = asyncHandler(async (req, res, next) => {
  // receive an array of workouts for the week
  const { workouts, date, week, user, totalDistance } = req.body;

  const { day, workoutId, comment } = req.body;
  // Check if day is provided
  if (!day) {
    return errorHandler(400, "Day is required");
  }
  // Check if workout is provided
  if (!workout) {
    return errorHandler(400, "Workout is required");
  }
  // Check if comment is provided
  if (!comment) {
    return errorHandler(400, "Comment is required");
  }

  // push the workout into workouts array
  workouts.push({
    day,
    workoutId,
    comment,
  });

  // Check if workouts is an array
  if (!Array.isArray(workouts)) {
    return errorHandler(400, "Workouts must be an array");
  }
  // Check if workouts is provided
  if (!workouts) {
    return errorHandler(400, "Workouts are required");
  }
  // Check if date is provided
  if (!date) {
    return errorHandler(400, "Date is required");
  }
  // Check if week is provided
  if (!week) {
    return errorHandler(400, "Week is required");
  }
  // Check if user is provided
  if (!user) {
    return errorHandler(400, "User is required");
  }
  // Check if user exists
  const userExists = await User.findById(user);
  if (!userExists) {
    return errorHandler(404, "User not found");
  }
  // calculate total distance
  totalDistance = workouts.reduce((acc, workout) => {
    return acc + workout.distance;
  }, 0);

  try {
    const trainingPlan = await TrainingPlan.create({
      workouts,
      date,
      week,
      user,
      totalDistance,
    });
    res.status(201).json({
      message: "Training plan created successfully",
      trainingPlan,
    });
  } catch (error) {
    next(error);
  }
});

export const getTrainingPlan = asyncHandler(async (req, res, next) => {
  const { user } = req.params;
  // Check if user is provided
  if (!user) {
    return errorHandler(400, "User is required");
  }
  // Check if user exists
  const userExists = await User.findById(user);
  if (!userExists) {
    return errorHandler(404, "User not found");
  }
  try {
    const trainingPlan = await TrainingPlan.find({ user }).populate(
      "workouts.workout"
    );
    res.status(200).json({
      message: "Training plan retrieved successfully",
      trainingPlan,
    });
  } catch (error) {
    next(error);
  }
});

export const getAllWorkouts = asyncHandler(async (req, res, next) => {
  const { user } = req.params;
  // Check if user is provided
  if (!user) {
    return errorHandler(400, "User is required");
  }
  // Check if user exists
  const userExists = await User.findById(user);
  if (!userExists) {
    return errorHandler(404, "User not found");
  }
  try {
    const workouts = await Workout.find({ user });
    res.status(200).json({
      message: "Workouts retrieved successfully",
      workouts,
    });
  } catch (error) {
    next(error);
  }
});

export const getWorkout = asyncHandler(async (req, res, next) => {
  const { user } = req.params;
  // Check if user is provided
  if (!user) {
    return errorHandler(400, "User is required");
  }
  // Check if user exists
  const userExists = await User.findById(user);
  if (!userExists) {
    return errorHandler(404, "User not found");
  }
  try {
    const workout = await Workout.find({ user });
    res.status(200).json({
      message: "Workout retrieved successfully",
      workout,
    });
  } catch (error) {
    next(error);
  }
});

export const updateWorkout = asyncHandler(async (req, res, next) => {
  const { user } = req.params;
  // Check if user is provided
  if (!user) {
    return errorHandler(400, "User is required");
  }
  // Check if user exists
  const userExists = await User.findById(user);
  if (!userExists) {
    return errorHandler(404, "User not found");
  }
  try {
    const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!workout) {
      return errorHandler(404, "Workout not found");
    }
    res.status(200).json({
      message: "Workout updated successfully",
      workout,
    });
  } catch (error) {
    next(error);
  }
});

export const deleteWorkout = asyncHandler(async (req, res, next) => {
  const { user } = req.params;
  // Check if user is provided
  if (!user) {
    return errorHandler(400, "User is required");
  }
  // Check if user exists
  const userExists = await User.findById(user);
  if (!userExists) {
    return errorHandler(404, "User not found");
  }
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);
    if (!workout) {
      return errorHandler(404, "Workout not found");
    }
    res.status(200).json({
      message: "Workout deleted successfully",
      workout,
    });
  } catch (error) {
    next(error);
  }
});


// Get workout by ID
export const getWorkoutById = asyncHandler(async (req, res, next) => {
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
});

// Update training plan
export const updateTrainingPlan = asyncHandler(async (req, res, next) => {
  const { week, workouts } = req.body;
  
  const plan = await TrainingPlan.findOneAndUpdate(
    { _id: req.params.id, user: req.params.user },
    { week, workouts },
    { new: true, runValidators: true }
  ).populate('workouts.workout');

  if (!plan) {
    return next(errorHandler(404, 'Training plan not found'));
  }

  res.status(200).json({
    success: true,
    data: plan
  });
});

// Delete training plan
export const deleteTrainingPlan = asyncHandler(async (req, res, next) => {
  const plan = await TrainingPlan.findOneAndDelete({
    _id: req.params.id,
    user: req.params.user
  });

  if (!plan) {
    return next(errorHandler(404, 'Training plan not found'));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Mark workout as complete
export const completeWorkout = asyncHandler(async (req, res, next) => {
  const { planId, workoutId, actualDistance, notes } = req.body;

  const plan = await TrainingPlan.findOne({
    _id: planId,
    user: req.params.user
  });

  if (!plan) {
    return next(errorHandler(404, 'Training plan not found'));
  }

  const workoutIndex = plan.workouts.findIndex(
    w => w.workout.toString() === workoutId
  );

  if (workoutIndex === -1) {
    return next(errorHandler(404, 'Workout not found in plan'));
  }

  plan.workouts[workoutIndex].completed = true;
  plan.workouts[workoutIndex].completedAt = new Date();
  plan.workouts[workoutIndex].actualDistance = actualDistance;
  plan.workouts[workoutIndex].notes = notes;

  // Update completed distance
  plan.completedDistance = plan.workouts
    .filter(w => w.completed)
    .reduce((sum, w) => sum + (w.actualDistance || 0), 0);

  await plan.save();

  res.status(200).json({
    success: true,
    data: plan
  });
});