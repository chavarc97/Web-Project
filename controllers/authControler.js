import { errorHandler } from "../middleware/error.js";
import bcryptjs from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const test = asyncHandler(async (req, res, next) => {
  res.json({
    message: "Auth route is working",
  });
});

// signUp controller
export const signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide all fields");
  }
  // check if user already exists
  const userExists = await User.find({ email });
  if (!userExists) {
    return next(errorHandler(400, "User already exists"));
  }
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });
  try {
    await newUser.save();
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// signIn controller
export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide all fields");
  }

  try {
    const validUser = await User.find({ email });
    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }

    const isPasswordValid = bcryptjs.compareSync(password, validUser.password);
    if (!isPasswordValid) {
      return next(errorHandler(401, "Wrong credentials!"));
    }

    const token = jwt.sign(
      {
        id: validUser._id,
      },
      process.env.JWT_SECRET
    );

    const { password: pass, ...rest } = validUser.toObject();

    res
      .cookie("access_token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .status(200)
      .json(rest);

  } catch (error) {
    next(error);
  }
});

// Google signIn controller
export const google = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user.toObject();
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser.toObject();
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
});

// signOut controller
export const signOut = asyncHandler(async (req, res, next) => {

    try {
      // 1. clear the access_token cookie
      res.clearCookie("access_token");
      // 2. send a success message
      res.status(200).json("User signed out successfully");
    } catch (error) {
      // 3. if an error occurs, pass it to the error handler
      next(error);
    }
  });