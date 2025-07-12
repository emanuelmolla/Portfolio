const express = require("express");

const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./service/connectDB");
connectDB();

const blogRoutes = require("./routes/blogRoutes");

const PORT = process.env.PORT;

const app = express();

app.use(express.json());

app.use("/blogs", blogRoutes);

app.listen(PORT, () => {
  console.log(`All good server is runing on port: ${PORT}`);
});
