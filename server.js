const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const router = require("./src/routes");
const connectDB = require("./src/utils/db");
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require("./src/middlewares/errorHandle.middleware");

dotenv.config();
const app = express();

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

// main router
app.use("/api" , router);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    connectDB(MONGO_URI);
});
