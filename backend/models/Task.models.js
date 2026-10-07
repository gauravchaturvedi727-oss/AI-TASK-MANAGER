const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        completed: {
            type: Boolean,
            default: false,
        },

        completedAt: {
            type: Date,
            default: null,
        },

        // Task completed hone ke 7 days baad
        // MongoDB automatically delete karega
        expiresAt: {
            type: Date,
            default: null,
            expires: 0,
        },
    },
    {
        timestamps: true,
    }
);

const TaskModel = mongoose.model("Task", taskSchema);

module.exports = TaskModel;