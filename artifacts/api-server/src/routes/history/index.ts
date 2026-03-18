import { Router, type IRouter } from "express";
import { db, searchHistoryTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/history", async (_req, res): Promise<void> => {
  const history = await db
    .select()
    .from(searchHistoryTable)
    .orderBy(desc(searchHistoryTable.createdAt));

  res.json(history);
});

router.delete("/history", async (_req, res): Promise<void> => {
  await db.delete(searchHistoryTable);
  res.json({ success: true, message: "History cleared" });
});

export default router;
