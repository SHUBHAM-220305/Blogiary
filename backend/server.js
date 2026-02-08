const express = require("express");
const cors = require("cors");
const dbConnect = require("./config/dbConnect");
const userRoute = require("./routes/userRoutes");
const blogRoute = require("./routes/blogRoutes");
const cloudinaryConfig = require("./config/cloudinaryConfig");
const { PORT, FRONTEND_URL } = require("./config/dotenv.config");
const port = PORT || 5000;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use("/api/v1", userRoute);
app.use("/api/v1", blogRoute);

app.listen(port, () => {
  console.log("Server Started!");
  dbConnect();
  cloudinaryConfig();
});
