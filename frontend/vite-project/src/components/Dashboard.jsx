import TaskManager from "../components/TaskManager";
import "./Dashboard.css";

function Dashboard() {
    return (
        <div className="dashboard">

            <header className="dashboard-header">

                <div className="brand-badge">
                    ✦ SOURAV AI
                </div>

                <h1>
                    Your Personal Productivity OS
                </h1>

                <p>
                    Only for Sourav. Study well and be 
                    Consistent.
                </p>

            </header>

            <main className="dashboard-content">
                <TaskManager />
            </main>

        </div>
    );
}

export default Dashboard;