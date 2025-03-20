const express = require("express");
const connectDB = require('./config/connection');

// Initialize the express app
const app = express();

connectDB();


app.use(express.json());
app.use(express.urlencoded({ extended: false })); 


app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`. yellow.bold);
})

// routes
app.use('/api/auth', authRouter);


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    })
})