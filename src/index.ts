import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import "reflect-metadata";
import { APP_ORIGIN, SERVER_PORT } from "./constants/env";
import { OK } from "./constants/http";
import errorHandler from "./middleware/errorHandler";
// import { AppDataSource } from "./database/datasource";
import { AppDataSource } from "./database/datasource";
import authenticate from "./middleware/authenticate";
import authRoutes from "./routes/auth.route";
import sessionRoutes from "./routes/session.route";
import userRoutes from "./routes/user.route";

// Tạo ứng dụng Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: APP_ORIGIN, credentials: true }));
app.use(cookieParser());

// Khởi tạo kết nối tới cơ sở dữ liệu

const initializeDatabase = async () => {
  try {
    console.log("dir" + __dirname);
    await AppDataSource.initialize();
    console.log("Kết nối thành công tới cơ sở dữ liệu PostgreSQL");
    console.log("Entities:", AppDataSource.entityMetadatas);
  } catch (error) {
    console.error("Lỗi khi kết nối tới cơ sở dữ liệu PostgreSQL:", error);
    process.exit(1);
  }
};

app.get("/", (req, res) => {
  res.status(OK).json({ status: "healthy" });
});
// auth routes
app.use("/auth", authRoutes);

// protected routes
app.use("/user", authenticate, userRoutes);
app.use("/sessions", authenticate, sessionRoutes);
app.use(errorHandler);

// Khởi động server
const startServer = () => {
  app.listen(SERVER_PORT, () => {
    console.log("Server is listening on port " + SERVER_PORT);
  });
};

// Khởi động ứng dụng
const runApp = async () => {
  await initializeDatabase();
  startServer();
};

runApp();
