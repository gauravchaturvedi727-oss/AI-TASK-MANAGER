import { useEffect, useState } from "react";
import api from "../service/api";
import "./TaskManager.css";

function TaskManager() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");


    const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);


    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [processingTaskId, setProcessingTaskId] =
        useState(null);

    const [error, setError] = useState("");


    const fetchTasks = async () => {
        try {
            setError("");

            const response = await api.get(
                "/tasks/getTask"
            );

            setTasks(response.data.tasks || []);

        } catch (error) {
            console.error(
                "Fetch active tasks error:",
                error
            );

            setError(
                "Unable to load your active tasks."
            );

        } finally {
            setLoading(false);
        }
    };


    const fetchCompletedTasks = async () => {
        try {
            setHistoryLoading(true);

            const response = await api.get(
                "/tasks/completed"
            );

            setCompletedTasks(
                response.data.tasks || []
            );

        } catch (error) {
            console.error(
                "Fetch completed tasks error:",
                error
            );

        } finally {
            setHistoryLoading(false);
        }
    };


    useEffect(() => {
        fetchTasks();
        fetchCompletedTasks();
    }, []);


    const addTask = async (e) => {
        e.preventDefault();

        const cleanTitle = title.trim();
        const cleanDescription =
            description.trim();


        if (!cleanTitle) {
            setError(
                "Please enter a task title."
            );

            return;
        }

        if (!cleanDescription) {
            setError(
                "Please enter a task description."
            );

            return;
        }


        try {
            setSaving(true);
            setError("");

            await api.post(
                "/tasks/add",
                {
                    title: cleanTitle,
                    description: cleanDescription,
                }
            );



            setTitle("");
            setDescription("");



            await fetchTasks();

        } catch (error) {
            console.error(
                "Add task error:",
                error
            );

            setError(
                "Unable to create the task. Please try again."
            );

        } finally {
            setSaving(false);
        }
    };


    const toggleTask = async (
        taskId,
        completed
    ) => {


        if (processingTaskId) {
            return;
        }


        try {

            setProcessingTaskId(taskId);
            setError("");


            
            if (!completed) {

                const response =
                    await api.patch(
                        `/tasks/update/${taskId}`,
                        {
                            completed: true,
                        }
                    );



                const updatedTask =
                    response.data.task;



                setTasks((currentTasks) =>
                    currentTasks.map(
                        (task) =>
                            task._id === taskId
                                ? updatedTask
                                : task
                    )
                );



                setCompletedTasks(
                    (currentTasks) => [
                        updatedTask,
                        ...currentTasks,
                    ]
                );


                setTimeout(() => {

                    setTasks((currentTasks) =>
                        currentTasks.filter(
                            (task) =>
                                task._id !== taskId
                        )
                    );

                    setProcessingTaskId(null);

                }, 1000);


                return;
            }


            await api.patch(
                `/tasks/update/${taskId}`,
                {
                    completed: false,
                }
            );


        
            await fetchTasks();

            await fetchCompletedTasks();


            setProcessingTaskId(null);

        } catch (error) {

            console.error(
                "Update task error:",
                error
            );

            setError(
                "Unable to update the task. Please try again."
            );

            setProcessingTaskId(null);
        }
    };

    const deleteTask = async (
        taskId
    ) => {

        if (processingTaskId) {
            return;
        }


        try {

            setProcessingTaskId(taskId);
            setError("");


            await api.delete(
                `/tasks/delete/${taskId}`
            );



            setTasks((currentTasks) =>
                currentTasks.filter(
                    (task) =>
                        task._id !== taskId
                )
            );


            setCompletedTasks(
                (currentTasks) =>
                    currentTasks.filter(
                        (task) =>
                            task._id !== taskId
                    )
            );


        } catch (error) {

            console.error(
                "Delete task error:",
                error
            );

            setError(
                "Unable to delete the task. Please try again."
            );

        } finally {

            setProcessingTaskId(null);
        }
    };


    const formatDateTime = (date) => {

        if (!date) {
            return "—";
        }


        return new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        ).format(
            new Date(date)
        );
    };


    const activeTaskCount =
        tasks.length;


    return (
        <section className="task-manager">



            <div className="task-manager-header">

                <div>

                    <span className="section-label">
                        PRODUCTIVITY
                    </span>


                    <h2>
                        Sourav's Tasks
                    </h2>


                    <p>
                        Stay organized and keep
                        moving forward.
                    </p>

                </div>


                <div className="task-count">

                    <strong>
                        {activeTaskCount}
                    </strong>


                    <span>
                        {activeTaskCount === 1
                            ? "Active task"
                            : "Active tasks"}
                    </span>

                </div>

            </div>



            {error && (

                <div
                    className="task-error"
                    role="alert"
                >

                    <span>
                        !
                    </span>


                    <p>
                        {error}
                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>

                </div>

            )}



            <form
                className="task-form"
                onSubmit={addTask}
            >

                <div className="form-header">

                    <div>

                        <h3>
                            Create a new task
                        </h3>


                        <p>
                            Add something you want
                            to accomplish.
                        </p>

                    </div>

                </div>


                {/* TITLE */}

                <div className="form-field">

                    <label htmlFor="task-title">
                        Task title
                    </label>


                    <input
                        id="task-title"
                        type="text"
                        placeholder="e.g. Complete React project"
                        value={title}
                        onChange={(e) => {

                            setTitle(
                                e.target.value
                            );

                            setError("");

                        }}
                        disabled={saving}
                        maxLength={100}
                    />


                    <span className="character-count">
                        {title.length}/100
                    </span>

                </div>


                {/* DESCRIPTION */}

                <div className="form-field">

                    <label htmlFor="task-description">
                        Description
                    </label>


                    <textarea
                        id="task-description"
                        placeholder="Describe what needs to be done..."
                        value={description}
                        onChange={(e) => {

                            setDescription(
                                e.target.value
                            );

                            setError("");

                        }}
                        disabled={saving}
                        maxLength={500}
                    />


                    <span className="character-count">
                        {description.length}/500
                    </span>

                </div>


                {/* ADD BUTTON */}

                <button
                    type="submit"
                    className="add-task-btn"
                    disabled={
                        saving ||
                        !title.trim() ||
                        !description.trim()
                    }
                >

                    {saving ? (

                        <>
                            <span
                                className="button-spinner"
                            />

                            Creating...
                        </>

                    ) : (

                        <>
                            <span className="plus-icon">
                                +
                            </span>

                            Add task
                        </>

                    )}

                </button>

            </form>



            <div className="tasks-section">


                <div className="tasks-section-header">

                    <h3>
                        Active tasks
                    </h3>


                    <span>
                        {activeTaskCount}
                    </span>

                </div>


                {/* LOADING */}

                {loading ? (

                    <div className="tasks-loading">

                        <span
                            className="loading-spinner"
                        />

                        <p>
                            Loading your tasks...
                        </p>

                    </div>


                ) : activeTaskCount === 0 ? (


                    /* EMPTY */

                    <div className="empty-state">

                        <div className="empty-icon">
                            ✓
                        </div>


                        <h3>
                            You're all caught up
                        </h3>


                        <p>
                            No active tasks right now.
                            Create one above to get started.
                        </p>

                    </div>


                ) : (


                    /* TASK LIST */

                    <div className="task-list">

                        {tasks.map((task) => {

                            const isProcessing =
                                processingTaskId ===
                                task._id;


                            return (

                                <article
                                    className={`task-card ${
                                        task.completed
                                            ? "task-completed"
                                            : ""
                                    } ${
                                        isProcessing
                                            ? "task-processing"
                                            : ""
                                    }`}
                                    key={task._id}
                                >


                                    {/* STATUS */}

                                    <div className="task-status">

                                        <span
                                            className={
                                                task.completed
                                                    ? "status-dot completed"
                                                    : "status-dot"
                                            }
                                        />


                                        <span>
                                            {task.completed
                                                ? "Completed"
                                                : "In progress"}
                                        </span>

                                    </div>


                                    {/* CONTENT */}

                                    <div className="task-content">

                                        <h4>
                                            {task.title}
                                        </h4>


                                        <p>
                                            {task.description}
                                        </p>

                                    </div>


                                    {/* META */}

                                    <div className="task-meta">

                                        <div>

                                            <span>
                                                Created
                                            </span>


                                            <strong>
                                                {formatDateTime(
                                                    task.createdAt
                                                )}
                                            </strong>

                                        </div>


                                        {task.completed &&
                                            task.completedAt && (

                                                <div
                                                    className="completed-meta"
                                                >

                                                    <span>
                                                        Completed
                                                    </span>


                                                    <strong>
                                                        {formatDateTime(
                                                            task.completedAt
                                                        )}
                                                    </strong>

                                                </div>

                                            )}

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="task-actions">

                                        <button
                                            type="button"
                                            className="complete-btn"
                                            onClick={() =>
                                                toggleTask(
                                                    task._id,
                                                    task.completed
                                                )
                                            }
                                            disabled={
                                                isProcessing
                                            }
                                        >

                                            {task.completed
                                                ? "✓ Completed"
                                                : "Complete"}

                                        </button>


                                        <button
                                            type="button"
                                            className="delete-btn"
                                            onClick={() =>
                                                deleteTask(
                                                    task._id
                                                )
                                            }
                                            disabled={
                                                isProcessing
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </article>

                            );
                        })}

                    </div>

                )}

            </div>


            {/* ======================================
                COMPLETED HISTORY
            ====================================== */}

            <div className="tasks-section completed-history">

                <div className="tasks-section-header">

                    <h3>
                        Completed History
                    </h3>


                    <span>
                        {completedTasks.length}
                    </span>

                </div>


                {historyLoading ? (

                    <div className="tasks-loading">

                        <span
                            className="loading-spinner"
                        />

                        <p>
                            Loading completed history...
                        </p>

                    </div>

                ) : completedTasks.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            ✓
                        </div>


                        <h3>
                            No completed tasks yet
                        </h3>


                        <p>
                            Completed tasks will appear
                            here for the next 7 days.
                        </p>

                    </div>

                ) : (

                    <div className="task-list">

                        {completedTasks.map((task) => (

                            <article
                                className="task-card task-completed"
                                key={task._id}
                            >


                                {/* STATUS */}

                                <div className="task-status">

                                    <span className="status-dot completed" />

                                    <span>
                                        Completed
                                    </span>

                                </div>


                                {/* CONTENT */}

                                <div className="task-content">

                                    <h4>
                                        {task.title}
                                    </h4>


                                    <p>
                                        {task.description}
                                    </p>

                                </div>


                                {/* TIME */}

                                <div className="task-meta">

                                    <div>

                                        <span>
                                            Created
                                        </span>


                                        <strong>
                                            {formatDateTime(
                                                task.createdAt
                                            )}
                                        </strong>

                                    </div>


                                    <div className="completed-meta">

                                        <span>
                                            Completed
                                        </span>


                                        <strong>
                                            {formatDateTime(
                                                task.completedAt
                                            )}
                                        </strong>

                                    </div>

                                </div>


                                {/* DELETE */}

                                <div className="task-actions">

                                    <button
                                        type="button"
                                        className="delete-btn"
                                        onClick={() =>
                                            deleteTask(
                                                task._id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                            </article>

                        ))}

                    </div>

                )}

            </div>

        </section>
    );
}

export default TaskManager;