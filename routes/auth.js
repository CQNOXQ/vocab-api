import { Router } from "express";
import { db } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = Router();

function setCookie(res, payload) {
  const isProd = process.env.NODE_ENV === "production";
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 3600 * 1000,
  });
}

router.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "MISSING_FIELD" });
  const exists = db.prepare("SELECT id FROM users WHERE email=?").get(email);
  if (exists) return res.status(409).json({ error: "EMAIL_EXISTS" });
  const hash = bcrypt.hashSync(password, 10);
  const now = Date.now();
  const info = db
    .prepare("INSERT INTO users(email, password_hash, created_at) VALUES(?,?,?)")
    .run(email, hash, now);
  setCookie(res, { sub: info.lastInsertRowid, email });
  res.json({ id: info.lastInsertRowid, email });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user) return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  setCookie(res, { sub: user.id, email });
  res.json({ id: user.id, email });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.json(null);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ id: payload.sub, email: payload.email });
  } catch {
    res.json(null);
  }
});

export default router;
