import express from "express";
import {
  submitExam,
  gradeSubmission,
  getStudentSubmission,
  getExamSubmissions,
} from "../controllers/studentSubmissionController.js";

const router = express.Router();

// Student routes
router.post("/submit", submitExam);
router.get("/result/:studentId/:examId", getStudentSubmission);

// Teacher routes
router.get("/exam/:examId", getExamSubmissions);
router.post("/grade/:submissionId", gradeSubmission);

export default router;
