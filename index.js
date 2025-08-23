const express = require("express");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./service/connectDB");
connectDB();

const blogRoutes = require("./routes/blog");
const pingRoute = require("./routes/ping");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/message");
const dashboardRoutes = require("./routes/dashboard");

const PORT = process.env.PORT;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/blogs", blogRoutes);
app.use("/ping", pingRoute);

app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);
app.use("/dashboard", dashboardRoutes);

app.listen(PORT, () => {
  console.log(`All good server is runing on port: ${PORT}`);
});
