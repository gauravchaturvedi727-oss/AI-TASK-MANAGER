const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Question is required"
            });
        }
        const TaskModel = require("../models/Task.models");

        const tasks = await TaskModel.find();
        const response = await axios.post(
            "http://localhost:5001/ask",
            {
                question,
                tasks
            }
        );

        return res.status(200).json({
            success: true,
            answer: response.data.answer,
            context: response.data.context
        });

    } catch (error) {
        console.error("AI route error:", error.message);

        return res.status(500).json({
            success: false,
            message: "AI service failed",
            error: error.message
        });
    }
});

module.exports = router;