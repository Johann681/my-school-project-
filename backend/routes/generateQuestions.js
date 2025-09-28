// backend/routes/exams.js
import express from "express";
import Exam from "../models/Exams.js";
import axios from "axios";
import he from "he";

const router = express.Router();

// Map subject to OpenTDB category IDs
const CATEGORY_MAP = {
  "General Knowledge": 9, "Books": 10, "Film": 11, "Music": 12, "Science": 17,
  "Computers": 18, "Mathematics": 19, "Mythology": 20, "Sports": 21, "Geography": 22,
  "History": 23, "Politics": 24, "Art": 25, "Celebrities": 26, "Animals": 27,
  "Vehicles": 28, "Comics": 29, "Gadgets": 30, "Anime & Manga": 31, "Cartoons": 32
};

// Simple deterministic fallback generator (used if OpenTDB fails)
function fallbackGenerate(subject, n, difficulty) {
  const result = [];
  for (let i = 0; i < n; i++) {
    const opts = [
      `Option A for ${subject} #${i + 1}`,
      `Option B for ${subject} #${i + 1}`,
      `Option C for ${subject} #${i + 1}`,
      `Option D for ${subject} #${i + 1}`,
    ];
    result.push({
      question: `${subject} question #${i + 1} (${difficulty})`,
      options: opts,
      answer: opts[0],
    });
  }
  return result;
}

function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ========================
// POST /api/exams/preview
// Returns generated questions (does NOT save)
// ========================
router.post("/preview", async (req, res) => {
  try {
    const { subject = "General Knowledge", questions = 5, difficulty = "Easy" } = req.body || {};
    const n = Math.max(1, Math.min(50, Number(questions) || 5)); // cap to 50

    const categoryId = CATEGORY_MAP[subject] || CATEGORY_MAP["General Knowledge"];

    // Query OpenTDB
    try {
      const response = await axios.get("https://opentdb.com/api.php", {
        params: { amount: n, category: categoryId, type: "multiple" },
        timeout: 8000,
      });

      // opentdb response_code: 0 = success, others = problems
      if (!response?.data || response.data.response_code !== 0) {
        // fallback if opentdb did not return usable data
        const fallback = fallbackGenerate(subject, n, difficulty);
        return res.json({ questions: fallback, source: "fallback" });
      }

      const previewQuestions = response.data.results.map((q) => {
        // decode HTML entities
        const correct = he.decode(q.correct_answer);
        const incorrect = q.incorrect_answers.map((a) => he.decode(a));
        const opts = shuffleArray([...incorrect, correct]);
        return {
          question: he.decode(q.question),
          answer: correct,
          options: opts,
        };
      });

      return res.json({ questions: previewQuestions, source: "opentdb" });
    } catch (opErr) {
      console.warn("OpenTDB call failed:", opErr?.message || opErr);
      // fallback generator when OpenTDB cannot be reached
      const fallback = fallbackGenerate(subject, n, difficulty);
      return res.json({ questions: fallback, source: "fallback" });
    }
  } catch (err) {
    console.error("Failed to generate questions:", err);
    return res.status(500).json({ error: "Failed to generate questions" });
  }
});

// ========================
// POST /api/exams/save
// Saves reviewed questions to DB
// ========================
router.post("/save", async (req, res) => {
  try {
    const { title, subject, difficulty, time = 0, questions, createdBy } = req.body || {};

    if (!title || !subject || !difficulty || !Array.isArray(questions) || !createdBy) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Optional: sanitize questions here if you want (strip HTML, validate structure)
    const exam = new Exam({
      title,
      subject,
      difficulty,
      time: Number(time || 0),
      questions, // raw reviewed questions
      generatedQuestions: questions,
      createdBy,
    });

    await exam.save();
    return res.json({ exam });
  } catch (err) {
    console.error("Failed to save exam:", err);
    return res.status(500).json({ error: "Failed to save exam" });
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
    if (!deleted) return res.status(404).json({ error: "Exam not found" });
    return res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    console.error("Failed to delete exam:", err);
    return res.status(500).json({ error: "Failed to delete exam" });
  }
});

// ========================
// GET /api/exams
// Fetch all exams
// ========================
router.get("/", async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    return res.json({ exams });
  } catch (err) {
    console.error("Failed to fetch exams:", err);
    return res.status(500).json({ error: "Failed to fetch exams" });
  }
});

export default router;
