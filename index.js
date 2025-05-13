import express from "express";
import dotenv from "dotenv";
dotenv.config();
import colors from "colors";
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js";
import connectDB from "./config/connection.js";
import cors from "cors";

const PORT = process.env.PORT || 3000;

// connect to database
connectDB();

const app = express();

// enable cors
const allowedOrigins = ["http://localhost:5173", "https://run-app-interface.vercel.app"];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false })); 

app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`. yellow.bold);
})


// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    })
})


