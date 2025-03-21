import express from "express";
// import authControllers
import {
  test,
  signUp,
  signIn,
  google,
  signOut,
} from "../controllers/authControler.js";
const router = express.Router();

// declare routes
router.get("/test", test);

// signUp 
router.post("/signup", signUp);

// signIn
router.post("/signin", signIn);
// Google signIn
router.post("/google", google);
// signOut
router.get("/signout", signOut);

export default router;
