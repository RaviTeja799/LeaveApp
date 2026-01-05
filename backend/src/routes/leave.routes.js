import express from 'express';
import { applyLeave, getPendingLeaves, decideLeave, getLeaveHistory } from '../controllers/leave.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/apply", auth, applyLeave)

router.get("/pending", auth, getPendingLeaves);

router.post("/decision", auth, decideLeave)

router.get("/:leaveId/history", auth, getLeaveHistory);

export default router;