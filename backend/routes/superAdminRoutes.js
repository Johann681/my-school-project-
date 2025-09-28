import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import SuperAdmin from "../models/SuperAdmin.js";

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register SuperAdmin (you can comment this out after first use)
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const exists = await SuperAdmin.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: "Super Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await SuperAdmin.create({
      username,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: superAdmin._id,
      username: superAdmin.username,
      token: generateToken(superAdmin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login SuperAdmin
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const superAdmin = await SuperAdmin.findOne({ username });

    if (superAdmin && (await bcrypt.compare(password, superAdmin.password))) {
      res.json({
        _id: superAdmin._id,
        username: superAdmin.username,
        token: generateToken(superAdmin._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
