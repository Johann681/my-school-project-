import express from "express";
import { createStudent, getAllExams, getExamById } from "../controllers/StudentController.js";

const router = express.Router();

// POST new student
router.post("/register", createStudent);

// GET all exams for student
router.get("/exams", getAllExams);

// GET single exam by ID
router.get("/exams/:examId", getExamById);

export default router;
