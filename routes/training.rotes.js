import express from "express";
import { verifyToken } from "../middleware/verifyUser";
import { checkPlanOwnership } from "../middleware/workoutOwnership";
import {
  createWorkout,
  addToTrainingPlan,
  getTrainingPlan,
  getAllWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout,
  completeWorkout,
} from "../controllers/training.Controller";

const router = express.Router();

// Routes
router.route("/training-plan/:id")
  .get(verifyToken, getTrainingPlan)
  .post(verifyToken, addToTrainingPlan);

router.route("/complete/:id")
  .put(checkPlanOwnership, completeWorkout);

router.route("/:id")
  .get(checkPlanOwnership, getWorkout)
  .put(checkPlanOwnership, updateWorkout)
  .delete(checkPlanOwnership, deleteWorkout);

export default router;
