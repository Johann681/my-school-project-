import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import superAdminRouter from "./routes/superAdminRoutes.js";
import teacherRouter from "./routes/teacherRoutes.js";
import examRouter from "./routes/examRoutes.js";
import studentSubmissionRoutes from "./routes/studentSubmissionRoutes.js";
import studentRouter from "./routes/StudentRoutes.js";




import generateQuestionsRouter from "./routes/generateQuestions.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Test route
app.get("/", (req, res) => res.send("Backend running ✅"));

// Routes
app.use("/api/generate-questions", generateQuestionsRouter);
app.use("/api/admin", superAdminRouter);   // <-- SuperAdmin routes
app.use("/api/teachers", teacherRouter);
app.use("/api/exams", examRouter);  // <-- This matches your frontend fetch
app.use("/api/submissions", studentSubmissionRoutes);
app.use("/api/student", studentRouter);


// Connect DB & start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error(err));
