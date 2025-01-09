import express from "express";
import dotenv from "dotenv";
import UserRoutes from "./Routes/userRoutes/userRouter.js"; // Ensure correct path to userRouter
import bodyParser from "body-parser";
import ErrorMiddleware from "./MiddleWare/ErrorMiddleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false })); // Helps to parse form data
app.use(cookieParser());

// CORS configuration to allow requests from anywhere
const corsOptions = {
  origin: "http://localhost:5173", // Specify the allowed origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow all methods
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization", // Allow necessary headers
  credentials: true, // Allow credentials
};

// Enable CORS with the updated configuration
app.use(cors(corsOptions));

// Routes
app.use("/api/v1/user", UserRoutes);

// Password Reseting
app.use(UserRoutes);

app.get("/", (req, res) => {
  res.json("Home Route");
});

// Global Error Handler
app.use(ErrorMiddleware);

// Export the configured app
export default app;
