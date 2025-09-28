import Exam from "../models/Exams.js";
import Student from "../models/student.js";

// Register new student
export const createStudent = async (req, res) => {
  try {
    const { name, email, class: studentClass } = req.body;

    if (!name || !email || !studentClass) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if student already exists
    let student = await Student.findOne({ email });
    if (student) return res.status(200).json({ student });

    student = new Student({ name, email, class: studentClass });
    await student.save();
    res.status(201).json({ student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create student" });
  }
};

// Fetch all exams (without answers)
export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    const publicExams = exams.map((ex) => ({
      _id: ex._id,
      title: ex.title,
      subject: ex.subject,
      difficulty: ex.difficulty,
      time: ex.time,
      questions: ex.questions,
      generatedQuestions: ex.generatedQuestions.map((q) => ({
        question: q.question,
        options: q.options,
      })),
    }));
    res.json(publicExams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
};

// Fetch a single exam by ID (without answers)
export const getExamById = async (req, res) => {
  try {
    const { examId } = req.params;
    const ex = await Exam.findById(examId);
    if (!ex) return res.status(404).json({ error: "Exam not found" });

    const publicExam = {
      _id: ex._id,
      title: ex.title,
      subject: ex.subject,
      difficulty: ex.difficulty,
      time: ex.time,
      questions: ex.questions,
      generatedQuestions: ex.generatedQuestions.map((q) => ({
        question: q.question,
        options: q.options,
      })),
    };

    res.json(publicExam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exam" });
  }
};
