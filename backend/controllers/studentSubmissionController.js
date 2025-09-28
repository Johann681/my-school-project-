import StudentSubmission from "../models/StudentSubmission.js";
import Exam from "../models/Exams.js";

// Student submits exam
export const submitExam = async (req, res) => {
  try {
    const { studentId, studentName, examId, answers } = req.body;
    if (!studentId || !examId || !answers || answers.length === 0) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    const submission = new StudentSubmission({
      studentId,
      studentName,
      examId,
      answers: answers.map((a) => {
        const correct = exam.generatedQuestions.find((q) => q.question === a.question)?.answer;
        return { ...a, correctAnswer: correct, isCorrect: null };
      }),
    });

    await submission.save();
    res.json({ message: "Submitted successfully", submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit exam" });
  }
};

// Teacher grades submission
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { gradedBy } = req.body;

    const submission = await StudentSubmission.findById(submissionId);
    if (!submission) return res.status(404).json({ error: "Submission not found" });

    let score = 0;
    submission.answers.forEach((a) => {
      if (a.selectedOption === a.correctAnswer) score += 1;
      a.isCorrect = a.selectedOption === a.correctAnswer;
    });

    submission.score = score;
    submission.gradedAt = new Date();
    submission.gradedBy = gradedBy || "Teacher";
    await submission.save();

    res.json({ message: "Graded successfully", submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to grade submission" });
  }
};

// Fetch student's own result
export const getStudentSubmission = async (req, res) => {
  try {
    const { studentId, examId } = req.params;
    const submission = await StudentSubmission.findOne({ studentId, examId });
    if (!submission) return res.status(404).json({ error: "Submission not found" });
    res.json({ submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
};

// Teacher fetches all submissions for an exam
export const getExamSubmissions = async (req, res) => {
  try {
    const { examId } = req.params;
    const submissions = await StudentSubmission.find({ examId });
    res.json({ submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};
