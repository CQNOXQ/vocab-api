import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  // 从 cookie 里取 token
  const token = req.cookies?.token;

  // 没有 token，拒绝访问
  if (!token) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  try {
    // 验证 token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 附加到 req.user，方便后续获取用户信息
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    console.error("Token 验证失败:", err.message);
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
}
