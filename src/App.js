/* bookhive/src/App.js */
import React, { useState, useEffect } from "react";
import Loading from "./components/Loading";
import "./styles/Loading.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Library from "./components/Library";
import Upload from "./components/Upload";
import Profile from "./components/Profile";
import "./styles/styles.css";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Auth from "./Pages/Auth";
import Dashboard from "./Pages/Dashboard";

function App() {
    const [activeComponent, setActiveComponent] = useState("Home");
    const [loading, setLoading] = useState(false);

    // Simulate loading on mount and on component change (for demo)
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 700); // Simulate fetch delay
        return () => clearTimeout(timer);
    }, [activeComponent]);

    const renderComponent = () => {
        switch (activeComponent) {
            case "Home":
                return <Home setActiveComponent={setActiveComponent} />;
            case "Library":
                return <Library />;
            case "Upload":
                return <Upload />;
            case "Profile":
                return <Profile />;
            default:
                return <Home setActiveComponent={setActiveComponent} />;
        }
    };

    const MainUI = () => (
        <div>
            {loading && <Loading />}
            <Navbar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
            <div className="container">
                {renderComponent()}
            </div>
        </div>
    );

    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<MainUI />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
