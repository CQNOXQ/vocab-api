import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import entryRoutes from "./routes/entries.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// 1) Render 在代理后面，开启 trust proxy，secure Cookie 才会生效
app.set("trust proxy", 1);

// 2) 跨域：不得用 "*"，必须是你的前端域名
const ORIGIN = process.env.ALLOW_ORIGIN || "https://cqnonxq.github.io";
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// 某些环境需要显式带上这个响应头
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// 可选：关闭 CORP，避免静态资源跨域限制过严
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// 前端打包或静态页（可留可去）
app.use(express.static(path.join(__dirname, "public")));

// 业务路由
app.use("/api/auth", authRoutes);
app.use("/api/entries", entryRoutes);

// 健康检查
app.get("/", (req, res) => {
  res.send("✅ API is running");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
