import express from "express";
import {
  updatePBs,
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
// Get user
router.get("/:id", verifyToken, getUser);
// Get all users
router.get("/", verifyToken, getAllUsers);
// Delete user
router.delete("/:id", verifyToken, deleteUser);
// Set Vdot
router.put("/vdot/:id", verifyToken, setVdot);

export default router;
