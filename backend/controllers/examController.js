import Exam from "../models/Exams.js";
import axios from "axios";
import he from "he";
import mongoose from "mongoose";


// 1️⃣ Generate / Preview questions
export const previewQuestions = async (req, res) => {
  try {
    const { subject, questions } = req.body;
    if (!subject || !questions) return res.status(400).json({ error: "Missing fields" });

    const CATEGORY_MAP = { "General Knowledge": 9, "Science": 17, /* etc */ };
    const categoryId = CATEGORY_MAP[subject] || 9;

    const response = await axios.get("https://opentdb.com/api.php", {
      params: { amount: questions, category: categoryId, type: "multiple" }
    });

    const preview = response.data.results.map(q => ({
      question: he.decode(q.question),
      answer: he.decode(q.correct_answer),
      options: [...q.incorrect_answers.map(a => he.decode(a)), he.decode(q.correct_answer)].sort(() => Math.random() - 0.5)
    }));

    res.json({ questions: preview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};
export const saveExam = async (req, res) => {
    try {
      const { title, subject, difficulty, time, questions, createdBy } = req.body;
      if (!title || !subject || !difficulty || !questions || !createdBy) {
        return res.status(400).json({ error: "Missing fields" });
      }
  
      const exam = new Exam({
        title,
        subject,
        difficulty,
        time,
        questions: questions.length,       // ✅ store number of questions
        generatedQuestions: questions,     // ✅ store the array
        createdBy
      });
  
      await exam.save();
      res.json({ exam });
    } catch (err) {
      console.error("Failed to save exam:", err.message); // log real error
      res.status(500).json({ error: "Failed to save exam" });
    }
  };
  
  // 3️⃣ Delete exam
  
  export const deleteExam = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid exam ID" });
      }
  
      const deleted = await Exam.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Exam not found" });
  
      res.json({ message: "Exam deleted successfully" });
    } catch (err) {
      console.error("Delete error:", err);  // <-- full error
      res.status(500).json({ error: "Failed to delete exam" });
    }
  };

// 4️⃣ Fetch all exams
export const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.json({ exams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
};
