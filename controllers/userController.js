import { errorHandler } from "../middleware/error.js";
import bcryptjs from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { calculateVdot, getTrainingPaces } from "../utils/vDotCalculator.js";
import { json } from "express";

export const updateUser = asyncHandler(async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account!"));
  try {
    // If password is provided, hash it
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        password: req.body.password,
        username: req.body.username,
        email: req.body.email,
        avatar: req.body.avatar,
      },
      { new: true }
    );

    // destructure the password from the rest of the user object
    const { password, ...rest } = updatedUser.toObject();
    // return the rest of the user object in the response
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
});

export const setVdot = asyncHandler(async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account!"));
  try {
    const { manualVdot, personalBests } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Option 1: Manually set VDOT
    if (manualVdot) {
      user.vDot.value = manualVdot;
      const paces = getTrainingPaces(manualVdot);
      user.vDot.trainingPaces.easy = paces.easy;
      user.vDot.trainingPaces.marathon = paces.marathon;
      user.vDot.trainingPaces.threshold = paces.threshold;
      user.vDot.trainingPaces.interval = paces.interval;
      user.vDot.trainingPaces.repetition = paces.repetition;
    }

    // Option 2: Calculate VDOT from race performance
    // todo: validate racePerformance
    if (personalBests) {
      const { distance, time, date } = personalBests;
      const vDot = calculateVdot(distance, time);
      user.vDot.value = vDot;
      const paces = getTrainingPaces(vDot);
      user.vDot.trainingPaces.easy = paces.easy;
      user.vDot.trainingPaces.marathon = paces.marathon;
      user.vDot.trainingPaces.threshold = paces.threshold;
      user.vDot.trainingPaces.interval = paces.interval;
      user.vDot.trainingPaces.repetition = paces.repetition;

      // Update personal bests
      user.personalBests = personalBests;
      user.personalBests.distance = distance;
      user.personalBests.time = time;
      user.personalBests.date = date;
      user.personalBests.vDot = vDot;
      user.personalBests.vDot.trainingPaces = paces;
      user.personalBests.vDot.calculatedFrom = {
        distance: distance,
        time: time,
        date: date,
      };
    }

    await user.save();

    // delete password from user object to avoid sending it to the client
    const { password: pass, ...rest } = user.toObject();
    res.status(200).json({
      message: "VDOT updated successfully",
      user: {
        ...rest,
        vDot: {
          ...rest.vDot,
          calculatedFrom: {
            distance: personalBests.distance,
            time: personalBests.time,
            date: personalBests.date,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export const updatePBs = asyncHandler(async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account!"));
  try {
    const { personalBests } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Update personal bests
    user.personalBests = personalBests;

    await user.save();

    // delete password from user object to avoid sending it to the client
    const { password: pass, ...rest } = user.toObject();
    res.status(200).json({
      message: "Personal bests updated successfully",
      user: rest,
    });
  } catch (error) {
    next(error);
  }
});

export const getUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");

    if (!users) {
      return next(errorHandler(404, "No users found"));
    }

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only delete your own account!"));
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json({
      message: "User deleted successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        vDot: user.vDot,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const pushTrainingPlan = asyncHandler(async (req, res, next) => {
  const { TrainingPlan } = req.body;
  // Check if TrainingPlan is provided
  if (!TrainingPlan) {
    return errorHandler(400, "TrainingPlan is required");
  }
  // update the training plan for the user
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    user.trainingPlan = TrainingPlan;
    await user.save();
    res.status(200).json({
      message: "Training plan updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        vDot: user.vDot,
        trainingPlan: user.trainingPlan,
      },
    });
  } catch (error) {
    next(error);
  }
});
