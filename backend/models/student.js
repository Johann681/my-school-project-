import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  class: { type: String }, // optional
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Student", studentSchema);
