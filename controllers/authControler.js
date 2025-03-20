const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const errorHandler = require("../middleware/error")

const signUp = asyncHandler(async (req, res, next) => {
    const { name, email, password, role, personalBests } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role,
        personalBests,
    })
    try {
        await newUser.save();
        res.status(201).json({
            message: "User created"
        });
    } catch (error) {
        next(error);
    }
})

const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email});
    
    try {
        if (user && (await user.comparePassword(password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "30d",
            });
            res.status(200).json({
                message: "User logged in",
                token,
            });
        } else {
            throw errorHandler(401, "Invalid email or password");
        }    
    } catch (error) {
        next(error);
    }
});



module.exports = {
    signUp,
    login,
};

