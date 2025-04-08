const mongoose = require("mongoose");

async function connectDB(URI_DB) {
    try {
      await mongoose.connect(URI_DB);
      console.log("Connect successfully!");
    } catch (err) {
      console.log("Connection failed!!!!");
    }
  }
 
module.exports = connectDB;