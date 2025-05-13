import express from "express";
import { verifyToken } from "../middleware/verifyUser.js";
import { checkPlanOwnership } from "../middleware/workoutOwnership.js";
import {
  getWeeklySummary,
  createWorkout,
  getAllWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  addToTrainingPlan,
  getTrainingPlans,
  getTrainingPlanById,
  updateTrainingPlan,
  deleteTrainingPlan,
  completeWorkout,
} from "../controllers/training.Controller.js";

const router = express.Router();

// routes
// summary
router.get("summary/:user", verifyToken, getWeeklySummary);
// workouts
router.post("/workouts", verifyToken, createWorkout);
// get the workouts of a user
router.get("/workouts/:user", verifyToken, getAllWorkouts);
router.get("/workouts/:id/:user", verifyToken, getWorkoutById);
router.put("/workouts/:id/:user", verifyToken, updateWorkout);
router.delete("/workouts/:id/:user", verifyToken, deleteWorkout);

// Training Plans
router.post("/plan", verifyToken, addToTrainingPlan);
router.get("/plan/:user", verifyToken, getTrainingPlans);
router.get("/plan/:id/:user", verifyToken, checkPlanOwnership, getTrainingPlanById);
router.put("/plan/:id/:user", verifyToken, checkPlanOwnership, updateTrainingPlan);
router.delete("/plan/:id/:user", verifyToken, checkPlanOwnership, deleteTrainingPlan);
router.post("/complete/:user", verifyToken, completeWorkout);



export default router;
