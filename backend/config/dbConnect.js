const mongoose = require("mongoose");
const { DB_URL } = require("./dotenv.config");

async function dbConnect() {
  try {
    await mongoose.connect(DB_URL);
    console.log("DB connected successfully");
  } catch (error) {
    console.log("Error occured while connecting to DB");
    console.log(error);
  }
}

module.exports = dbConnect;
