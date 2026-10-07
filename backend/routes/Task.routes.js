const express = require("express");

const {
    addTask,
    getTask,
    getCompletedTasks,
    getSingleTask,
    updateTask,
    deleteTask,
} = require("../controllers/Task.controllers");

const router = express.Router();


// Active tasks
router.get("/getTask", getTask);


// Completed history
router.get(
    "/completed",
    getCompletedTasks
);


// Add
router.post("/add", addTask);


// Single task
router.get(
    "/singleTask/:taskId",
    getSingleTask
);


// Update / Complete
router.patch(
    "/update/:taskId",
    updateTask
);


// Delete
router.delete(
    "/delete/:taskId",
    deleteTask
);


module.exports = router;