require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./models/initDB");

const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expense");


const app = express();

app.use(cors());
app.use(express.json());  // ← VERY IMPORTANT

app.use("/api/auth", authRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/ocr", require("./routes/ocr"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});