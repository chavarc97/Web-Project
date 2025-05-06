import express from "express";
// import authControllers
import {
  signUp,
  signIn,
  google,
  signOut,
} from "../controllers/authController.js";
import { signupSchema, signinSchema } from "../validations/authValidation.js";

const router = express.Router();

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};

// declare routes
// signUp 
router.post("/signup", validate(signupSchema), signUp);

// signIn
router.post("/signin", validate(signinSchema), signIn);
// Google signIn
router.post("/google", google);
// signOut
router.get("/signout", signOut);

export default router;
