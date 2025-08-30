import express from "express";
import { body, query } from "express-validator";

import KnowledgeBase from "../models/KnowledgeBase.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";
import { handleValidationErrors } from "../middleware/validate.js";

const router = express.Router();

router.get("/", query("q").optional().trim(), async (req, res) => {
  try {
    const q = req.query.q;
    let articles;
    if (q) {
      articles = await KnowledgeBase.find({ $text: { $search: q } })
        .sort({ score: { $meta: "textScore" } })
        .select("-__v");
    } else {
      articles = await KnowledgeBase.find().select("-__v").limit(20);
    }
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: "Server error searching knowledge base" });
  }
});

router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  [
    body("title").isLength({ min: 5 }).trim(),
    body("content").isLength({ min: 10 }),
    body("tags").optional().isArray(),
    body("category").isString().trim(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title, content, tags = [], category } = req.body;
      const kbArticle = new KnowledgeBase({
        title,
        content,
        tags,
        category,
        createdBy: req.user.id,
      });
      await kbArticle.save();
      res.status(201).json(kbArticle);
    } catch (err) {
      res.status(500).json({ message: "Server error creating KB article" });
    }
  }
);

export default router;
