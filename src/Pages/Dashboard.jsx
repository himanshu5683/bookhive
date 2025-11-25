import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthContext";

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div style={{ padding: 24 }}>
            <h1>Welcome {user?.email}</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;
