require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { default: router } = require("./src/routes");
const connectDB = require("./src/utils/db");

const port = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

connectDB(MONGO_URI);
const app = express();

app.use(cors()); // kich hoat cors cho cac api

// app.get("/" , router); // main router

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})