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
    if (personalBests) {
      const { distance, time, date } = personalBests;
      if (
        !personalBests.distance ||
        !personalBests.time ||
        !personalBests.date
      ) {
        return next(
          errorHandler(
            400,
            "Distance, time, and date are required for personal bests"
          )
        );
      }
      if (typeof personalBests.time !== "number") {
        return next(errorHandler(400, "Time must be provided in seconds"));
      }

      const vDot = calculateVdot(distance, time);

      // Update training paces
      const paces = getTrainingPaces(vDot);
      user.vDot = {
        value: vDot,
        trainingPaces: paces,
        calculatedFrom: {
          distance,
          time,
          date,
        },
      };
    }

    await user.save();

    // delete password from user object to avoid sending it to the client
    const { password: pass, ...rest } = user.toObject();

    // Prepare response object
    const responseData = {
      message: "VDOT updated successfully",
      user: rest,
    };

    // Only add calculatedFrom if personalBests was provided
    if (personalBests) {
      responseData.user.vDot = {
        ...rest.vDot,
        calculatedFrom: {
          distance: personalBests.distance,
          time: personalBests.time,
          date: personalBests.date,
        },
      };
    }

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
});

export const updateVdot = asyncHandler(async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account!"));
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const { vDot } = req.body;
    if (!vDot) {
      return next(errorHandler(400, "VDOT is required"));
    }
    user.vDot.value = vDot;
    const paces = getTrainingPaces(vDot);
    user.vDot.trainingPaces.easy = paces.easy;
    user.vDot.trainingPaces.marathon = paces.marathon;
    user.vDot.trainingPaces.threshold = paces.threshold;
    user.vDot.trainingPaces.interval = paces.interval;
    user.vDot.trainingPaces.repetition = paces.repetition;
    await user.save();
    // delete password from user object to avoid sending it to the client
    const { password: pass, ...rest } = user.toObject();
    res.status(200).json({
      message: "VDOT updated successfully",
      user: rest,
    });
  } catch (error) {
    next(error);
  }
});

export const updateUpcomingRaces = asyncHandler(async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account!"));
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const { name, date, projectedTime } = req.body;
    if (!name || !date || !projectedTime) {
      return next(errorHandler(400, "All fields are required"));
    }
    const upcomingRace = {
      name,
      date,
      projectedTime,
    };
    user.upcomingRaces.push(upcomingRace);
    await user.save();
    // delete password from user object to avoid sending it to the client
    const { password: pass, ...rest } = user.toObject();
    res.status(200).json({
      message: "upcomingRaces updated successfully",
      user: rest,
    });
  } catch (error) {
    next(error);
  }
});

export const updateRecentRaces = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const { name, location, distance, time, timeInSeconds, date } = req.body;
    if (!name || !location || !distance || !time || !timeInSeconds || !date) {
      return next(errorHandler(400, "All fields are required"));
    }
    const recentRace = {
      name,
      location,
      distance,
      time,
      timeInSeconds,
      date,
    };
    user.recentRaces.push(recentRace);
    await user.save();
    // delete password from user object to avoid sending it to the client
    const { password: pass, ...rest } = user.toObject();
    res.status(200).json({
      message: "recentRaces updated successfully",
      user: rest,
    });
  } catch (error) {
    next(error);
  }
});

export const updatePBs = asyncHandler(async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account!"));
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    const { personalBests } = req.body;

    // Only update provided race types
    if (personalBests) {
      const raceTypes = ["fiveK", "tenK", "halfMarathon", "marathon"];

      raceTypes.forEach((raceType) => {
        if (personalBests[raceType]) {
          // Only update fields that were provided
          const raceData = personalBests[raceType];

          // Convert time string to seconds if time was provided
          if (raceData.time) {
            // Validate time format
            const timeRegex = /^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/;
            if (!timeRegex.test(raceData.time)) {
              return next(
                errorHandler(
                  400,
                  `Invalid time format for ${raceType}. Please use HH:MM:SS format`
                )
              );
            }

            // Convert time to seconds
            const [hours, minutes, seconds] = raceData.time
              .split(":")
              .map(Number);
            raceData.timeInSeconds = hours * 3600 + minutes * 60 + seconds;
          }

          // Update only provided fields
          Object.keys(raceData).forEach((field) => {
            user.personalBests[raceType][field] = raceData[field];
          });
        }
      });
    }

    await user.save();

    // Remove password from user object to avoid sending it to client
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
