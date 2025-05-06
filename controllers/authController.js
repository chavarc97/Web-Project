import { errorHandler } from "../middleware/error.js";
import bcryptjs from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { signupSchema, signinSchema } from "../validations/authValidation.js";

// signUp controller
export const signUp = asyncHandler(async (req, res, next) => {
  const { username, email, password, role } = req.body;
  
  // Validate role against allowed values from schema
  if (role && !["user", "admin", "coach"].includes(role)) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid role. Allowed roles are: user, admin, coach"
    });
  }
  
  const hashedPassword = bcryptjs.hashSync(password, 10);
  
  const newUser = new User({ 
    username, 
    email, 
    password: hashedPassword,
    role // This should work since your schema allows this field with these values
  });
  
  try {
    await newUser.save();
    res.status(201).json({ 
      success: true,
      message: "User created successfully",
      user: {
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
      },
    });
  } catch (error) {
    // Handle mongoose validation errors more explicitly
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: validationErrors.join(', ')
      });
    }
    next(error);
  }
});

// signIn controller
export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Explicitly request the password field
    const validUser = await User.findOne({ email }).select("+password");

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

    // Remove password from the user object before sending it to the client
    const { password: pass, ...rest } = validUser.toObject();

    res
      .cookie("access_token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .status(200)
      .json({
        message: "User signed in successfully",
        user: rest,
        jwt: token,
      });
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
