import { Router } from "express";
import { db } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM entries WHERE user_id=? ORDER BY date DESC")
    .all(req.user.id);
  res.json(rows);
});

router.post("/", (req, res) => {
  const { date, words, minutes, note } = req.body;
  const now = Date.now();
  const info = db
    .prepare(
      "INSERT INTO entries(user_id,date,words,minutes,note,created_at,updated_at) VALUES(?,?,?,?,?,?,?)"
    )
    .run(req.user.id, date, words, minutes, note || "", now, now);
  const row = db.prepare("SELECT * FROM entries WHERE id=?").get(info.lastInsertRowid);
  res.json(row);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const info = db
    .prepare("DELETE FROM entries WHERE id=? AND user_id=?")
    .run(id, req.user.id);
  if (!info.changes) return res.status(404).json({ error: "NOT_FOUND" });
  res.json({ ok: true });
});

export default router;
