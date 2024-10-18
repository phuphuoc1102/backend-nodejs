"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const env_1 = require("./constants/env");
const http_1 = require("./constants/http");
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
// import { AppDataSource } from "./database/datasource";
const datasource_1 = require("./database/datasource");
const authenticate_1 = __importDefault(require("./middleware/authenticate"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const session_route_1 = __importDefault(require("./routes/session.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
// Tạo ứng dụng Express
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({ origin: env_1.APP_ORIGIN, credentials: true }));
app.use((0, cookie_parser_1.default)());
// Khởi tạo kết nối tới cơ sở dữ liệu
const initializeDatabase = async () => {
    try {
        console.log("dir" + __dirname);
        await datasource_1.AppDataSource.initialize();
        console.log("Kết nối thành công tới cơ sở dữ liệu PostgreSQL");
        console.log("Entities:", datasource_1.AppDataSource.entityMetadatas);
    }
    catch (error) {
        console.error("Lỗi khi kết nối tới cơ sở dữ liệu PostgreSQL:", error);
        process.exit(1);
    }
};
// Định nghĩa route mẫu
app.get("/", (req, res) => {
    res.status(http_1.OK).json({ status: "healthy" });
});
// app.get("/users/email/:email", async (req, res) => {
//   const { email } = req.params;
//   try {
//     console.log("Tìm user với email:", email);
//     const user = await AppDataSource.manager.findOne(User, {
//       where: { email },
//     });
//     if (user) {
//       return res.json(user); // Trả về thông tin user
//     } else {
//       return res.status(404).send("User not found");
//     }
//   } catch (error) {
//     console.error("Lỗi khi tìm user:", error);
//     return res.status(500).send("Internal server error");
//   }
// });
// app.post("/users", async (req, res) => {
//   const { email, password, role, activeStatus, sessionTimeoutAction } =
//     req.body;
//   const newUser = new User();
//   newUser.email = email;
//   newUser.password = password;
//   newUser.role = role;
//   newUser.activeStatus = activeStatus;
//   newUser.sessionTimeoutAction = sessionTimeoutAction;
//   try {
//     const savedUser = await AppDataSource.manager.save(newUser); // Lưu user mới vào DB
//     return res.status(201).json(savedUser); // Trả về user đã được thêm
//   } catch (error) {
//     console.error("Lỗi khi thêm user:", error);
//     return res.status(500).send("Internal server error");
//   }
// });
// auth routes
app.use("/auth", auth_route_1.default);
// protected routes
app.use("/user", authenticate_1.default, user_route_1.default);
app.use("/sessions", authenticate_1.default, session_route_1.default);
app.use(errorHandler_1.default);
// Khởi động server
const startServer = () => {
    app.listen(env_1.PORT, () => {
        console.log("Server is listening on port 3000");
    });
};
// Khởi động ứng dụng
const runApp = async () => {
    await initializeDatabase();
    startServer();
};
runApp();
