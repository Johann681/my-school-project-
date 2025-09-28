import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  difficulty: { type: String, required: true },
  time: { type: Number, required: true },
  questions: { type: Number, required: true },
  generatedQuestions: [
    {
      question: String,
      answer: String,
      options: [String],
    },
  ],
  createdBy: { type: String, required: true }, // teacher's ID or name
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Exam", examSchema);
