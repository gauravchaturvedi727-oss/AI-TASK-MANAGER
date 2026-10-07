const TaskModel = require("../models/Task.models");


// =====================================================
// ADD TASK
// =====================================================

async function addTask(req, res) {
    try {
        const { title, description } = req.body;

        if (!title?.trim() || !description?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required",
            });
        }

        const task = await TaskModel.create({
            title: title.trim(),
            description: description.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Task added successfully",
            task,
        });

    } catch (error) {

        console.error("Add task error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}


// =====================================================
// GET ACTIVE TASKS
// =====================================================

async function getTask(req, res) {
    try {

        const tasks = await TaskModel.find({
            completed: false,
        }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            message: "Active tasks retrieved successfully",
            tasks,
        });

    } catch (error) {

        console.error("Get tasks error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch tasks",
            error: error.message,
        });
    }
}


// =====================================================
// GET COMPLETED HISTORY
// =====================================================

async function getCompletedTasks(req, res) {
    try {

        const tasks = await TaskModel.find({
            completed: true,
        }).sort({
            completedAt: -1,
        });

        return res.status(200).json({
            success: true,
            message: "Completed task history retrieved successfully",
            tasks,
        });

    } catch (error) {

        console.error(
            "Get completed tasks error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch completed tasks",
            error: error.message,
        });
    }
}


// =====================================================
// GET SINGLE TASK
// =====================================================

async function getSingleTask(req, res) {
    try {

        const { taskId } = req.params;

        const task = await TaskModel.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task found successfully",
            task,
        });

    } catch (error) {

        console.error(
            "Get single task error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch task",
            error: error.message,
        });
    }
}


// =====================================================
// UPDATE TASK
// =====================================================

async function updateTask(req, res) {
    try {

        const { taskId } = req.params;

        const {
            title,
            description,
            completed,
        } = req.body;

        const updateData = {};


        // ---------------------------------------------
        // UPDATE TITLE
        // ---------------------------------------------

        if (title !== undefined) {

            if (!title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Title cannot be empty",
                });
            }

            updateData.title = title.trim();
        }


        // ---------------------------------------------
        // UPDATE DESCRIPTION
        // ---------------------------------------------

        if (description !== undefined) {

            if (!description.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Description cannot be empty",
                });
            }

            updateData.description =
                description.trim();
        }


        // ---------------------------------------------
        // COMPLETE / UNCOMPLETE
        // ---------------------------------------------

        if (completed !== undefined) {

            updateData.completed = completed;


            // =========================================
            // TASK COMPLETED
            // =========================================

            if (completed === true) {

                const completedAt = new Date();

                const expiresAt = new Date(
                    completedAt.getTime() +
                    7 * 24 * 60 * 60 * 1000
                );

                updateData.completedAt =
                    completedAt;

                updateData.expiresAt =
                    expiresAt;
            }


            // =========================================
            // TASK UNCOMPLETED
            // =========================================

            else {

                updateData.completedAt = null;

                updateData.expiresAt = null;
            }
        }


        // ---------------------------------------------
        // NOTHING TO UPDATE
        // ---------------------------------------------

        if (Object.keys(updateData).length === 0) {

            return res.status(400).json({
                success: false,
                message: "Provide at least one field to update",
            });
        }


        // ---------------------------------------------
        // UPDATE DATABASE
        // ---------------------------------------------

        const updatedTask =
            await TaskModel.findByIdAndUpdate(
                taskId,
                {
                    $set: updateData,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );


        if (!updatedTask) {

            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }


        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(200).json({
            success: true,
            message: completed === true
                ? "Task completed successfully"
                : "Task updated successfully",
            task: updatedTask,
        });

    } catch (error) {

        console.error(
            "Update task error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update task",
            error: error.message,
        });
    }
}


// =====================================================
// DELETE TASK MANUALLY
// =====================================================

async function deleteTask(req, res) {
    try {

        const { taskId } = req.params;

        const deletedTask =
            await TaskModel.findByIdAndDelete(taskId);

        if (!deletedTask) {

            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
            task: deletedTask,
        });

    } catch (error) {

        console.error(
            "Delete task error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete task",
            error: error.message,
        });
    }
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    addTask,
    getTask,
    getCompletedTasks,
    getSingleTask,
    updateTask,
    deleteTask,
};