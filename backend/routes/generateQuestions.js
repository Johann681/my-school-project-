// backend/routes/exams.js
import express from "express";
import Exam from "../models/Exams.js";
import axios from "axios";
import he from "he";

const router = express.Router();

// Map subject/emphasis to OpenTDB category IDs
const CATEGORY_MAP = {
  "General Knowledge": 9,
  "Books": 10,
  "Film": 11,
  "Music": 12,
  "Science": 17,
  "Computers": 18,
  "Mathematics": 19,
  "Mythology": 20,
  "Sports": 21,
  "Geography": 22,
  "History": 23,
  "Politics": 24,
  "Art": 25,
  "Celebrities": 26,
  "Animals": 27,
  "Vehicles": 28,
  "Comics": 29,
  "Gadgets": 30,
  "Anime & Manga": 31,
  "Cartoons": 32
};

// ========================
// STEP 1: Generate (Preview) Questions
// POST /api/exams/preview
// Returns generated questions without saving
// ========================
router.post("/preview", async (req, res) => {
  try {
    const { subject, questions } = req.body;

    if (!subject || !questions) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const categoryId = CATEGORY_MAP[subject] || 9;

    const response = await axios.get("https://opentdb.com/api.php", {
      params: { amount: questions, category: categoryId, type: "multiple" },
    });

    const previewQuestions = response.data.results.map((q) => ({
      question: he.decode(q.question),
      answer: he.decode(q.correct_answer),
      options: [
        ...q.incorrect_answers.map((ans) => he.decode(ans)),
        he.decode(q.correct_answer),
      ].sort(() => Math.random() - 0.5),
    }));

    res.json({ questions: previewQuestions });
  } catch (err) {
    console.error("Failed to generate questions:", err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

// ========================
// STEP 2: Save Questions
// POST /api/exams/save
// Saves reviewed questions to DB
// ========================
router.post("/save", async (req, res) => {
  try {
    const { title, subject, difficulty, time, questions, createdBy } = req.body;

    if (!title || !subject || !difficulty || !questions || !createdBy) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const exam = new Exam({
      title,
      subject,
      difficulty,
      time,
      questions,
      generatedQuestions: questions, // store the reviewed questions
      createdBy,
    });

    await exam.save();
    res.json({ exam });
  } catch (err) {
    console.error("Failed to save exam:", err);
    res.status(500).json({ error: "Failed to save exam" });
  }
});

// ========================
// DELETE /api/exams/:id
// Delete exam by ID
// ========================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Exam.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Exam not found" });
    }
    res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    console.error("Failed to delete exam:", err);
    res.status(500).json({ error: "Failed to delete exam" });
  }
});

// ========================
// GET /api/exams
// Fetch all exams
// ========================
router.get("/", async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.json({ exams });
  } catch (err) {
    console.error("Failed to fetch exams:", err);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
});

export default router;
