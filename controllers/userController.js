import { errorHandler } from "../middleware/error.js";
import bcryptjs from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { calculateVdot, getTrainingPaces } from "../utils/vDotCalculator.js";

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
