import express from "express";
import { getExams, previewQuestions, saveExam, deleteExam } from "../controllers/examController.js";

const router = express.Router();

// GET all exams
router.get("/", getExams);

// POST generate/preview exam questions
router.post("/generate", previewQuestions);

// POST save approved exam
router.post("/save", saveExam);

// DELETE an exam by ID
router.delete("/:id", deleteExam);

export default router;
