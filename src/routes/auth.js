import express from "express";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { SECRETS } from "../utils/consts.js";
import User from "../models/User.js";
import { handleValidationErrors } from "../middleware/validate.js";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already taken" });
      }
      const hashedPassword = await hashPassword(password);
      const user = new User({ email, password: hashedPassword });
      await user.save();
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        SECRETS.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
      res.status(201).json({ token });
    } catch (err) {
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").exists()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        SECRETS.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
      res.json({ token });
    } catch (err) {
      res.status(500).json({ message: "Server error during login" });
    }
  }
);

import { authenticateJWT } from "../middleware/auth.js";

router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
