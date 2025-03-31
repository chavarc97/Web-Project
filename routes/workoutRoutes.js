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
} from "../controllers/trainingController";

const router = express.Router();

// Routes
router.route("/")
  .post(createWorkout)
  .get(getAllWorkouts);

router.route("/:id")
  .get(checkPlanOwnership, getWorkout)
  .put(checkPlanOwnership, updateWorkout)
  .delete(checkPlanOwnership, deleteWorkout);

router.route("/complete/:id")
  .put(checkPlanOwnership, completeWorkout);

router.route("/training-plan/:id")
  .get(verifyToken, getTrainingPlan)
  .post(verifyToken, addToTrainingPlan);

export default router;
