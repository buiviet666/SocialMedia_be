const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const router = require("./src/routes");
const connectDB = require("./src/utils/db");
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require("./src/middlewares/errorHandle.middleware");
const http = require("http");
const { initSocket } = require("./src/sockets/socket");

dotenv.config();
const app = express();
const server = http.createServer(app); // 👈 dùng server này để truyền cho Socket.IO

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.get("/api", (req, res) => {
    res.send("Api is running...");
});

app.use("/api", router);
app.use(notFound);
app.use(errorHandler);

// Khởi tạo DB và Socket.IO
const port = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

connectDB(MONGO_URI);
initSocket(server); // 👈 khởi động socket với server

server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
