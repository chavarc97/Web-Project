import express from "express";
import dotenv from "dotenv";
dotenv.config();
import colors from "colors";
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js";
import trainingRouter from "./routes/training.rotes.js";
import connectDB from "./config/connection.js";
import cors from "cors";

const PORT = process.env.PORT || 3000;

// connect to database
connectDB();

const app = express();

// enable cors
app.use(cors())

app.use(express.json());
app.use(express.urlencoded({ extended: false })); 

app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`. yellow.bold);
})


// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/training", trainingRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    })
})


