import express from "express";
import {
  updatePBs,
  updateUpcomingRaces,
  updateUser,
  getAllUsers,
  getUser,
  deleteUser,
  setVdot,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyUser.js";

const router = express.Router();

// Update user
router.put("/:id", verifyToken, updateUser);
// Update personal bests
router.put("/pb/:id", verifyToken, updatePBs);
// Update upcoming races
router.put("/upcoming/:id", verifyToken, updateUpcomingRaces);
// Update recent races
router.put("/recent/:id", verifyToken, updateUpcomingRaces);
// Get user
router.get("/:id", verifyToken, getUser);
// Get all users
router.get("/", verifyToken, getAllUsers);
// Delete user
router.delete("/:id", verifyToken, deleteUser);
// Set Vdot
router.put("/vdot/:id", verifyToken, setVdot);

export default router;
