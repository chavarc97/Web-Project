import express from "express";
import { verifyToken } from "../middleware/verifyUser";
import {
  createWorkout,
  addToTrainingPlan,
  getTrainingPlan,
  getAllWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout,
} from "../controllers/trainingController";

const router = express.Router();

// Routes
router.post("/create", verifyToken, createWorkout);
router.post("/add-to-plan", verifyToken, addToTrainingPlan);
router.get("/get-training-plan/:id", verifyToken, getTrainingPlan);
router.get("/get-all-workouts/:id", verifyToken, getAllWorkouts);
router.get("/get-workout/:id", verifyToken, getWorkout);
router.put("/update/:id", verifyToken, updateWorkout);
router.delete("/delete/:id", verifyToken, deleteWorkout);

// Export router
export default router;
