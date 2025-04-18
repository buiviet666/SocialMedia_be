require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./src/routes");
const connectDB = require("./src/utils/db");
const cookieParser = require('cookie-parser');

const port = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

connectDB(MONGO_URI);

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// main router
app.use("/api" , router);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})