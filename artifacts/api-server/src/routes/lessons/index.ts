import { Router, type IRouter } from "express";
import { db, searchHistoryTable } from "@workspace/db";
import { GenerateLessonBody, GenerateQuizBody } from "@workspace/api-zod";
import { generateLesson, generateQuiz } from "../../lib/gemini.js";

const router: IRouter = Router();

router.post("/lessons/generate", async (req, res): Promise<void> => {
  const parsed = GenerateLessonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { topic, level } = parsed.data;
  const lesson = await generateLesson(topic, level);

  await db.insert(searchHistoryTable).values({ topic, level });

  res.json(lesson);
});

router.post("/lessons/quiz", async (req, res): Promise<void> => {
  const parsed = GenerateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { lessonContent, topic, level } = parsed.data;
  const quiz = await generateQuiz(lessonContent, topic, level);

  res.json(quiz);
});

export default router;
