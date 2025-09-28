import mongoose from "mongoose";

const studentSubmissionSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  answers: [
    {
      question: String,
      selectedOption: String,
      correctAnswer: String,
      isCorrect: Boolean,
    },
  ],
  score: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  gradedAt: Date,
  gradedBy: String,
});

export default mongoose.model("StudentSubmission", studentSubmissionSchema);
