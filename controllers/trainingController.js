import asyncHandler from "express-async-handler";
import Workout from "../models/workoutModel.js";
import TrainingPlan from "../models/planModel.js";
import { errorHandler } from "../middleware/error.js";
import User from "../models/userModel.js";

export const createWorkout = asyncHandler(async (req, res, next) => {
  const { workoutName, warmUp, work, coolDown, user } = req.body;
  // Check if workoutName is provided
  if (!workoutName) {
    return errorHandler(400, "Workout name is required");
  }

  if (!user) {
    return errorHandler(400, "User is required");
  }
  // Check if user exists
  const userExists = await User.findById(user);
  if (!userExists) {
    return errorHandler(404, "User not found");
  }
  try {
    const workout = await Workout.create({
      workoutName,
      warmUp,
      work,
      coolDown,
      user,
    });
  } catch (error) {
    next(error);
  }
});

export const addToTrainingPlan = asyncHandler(async (req, res, next) => {
  // receive an array of workouts for the week
  const { workouts, date, week, user, totalDistance } = req.body;

  const { day, workout, comment } = req.body;
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
    workout,
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
