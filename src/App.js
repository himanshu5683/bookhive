/* bookhive/src/App.js */
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "./styles/styles.css";

import { AuthProvider } from "./auth/AuthContext";
import { CreditProvider } from "./context/CreditContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./auth/ProtectedRoute";
// Page Components
import Dashboard from "./Pages/Dashboard";
import Resources from "./Pages/Resources";
import Stories from "./Pages/Stories";
import StudyCircles from "./Pages/StudyCircles";
import Leaderboard from "./Pages/Leaderboard";
import UserProfile from "./Pages/UserProfile";
import Upload from "./Pages/Upload";
import FileList from "./Pages/FileList";

// Authentication Pages
import Login from "./Pages/auth/Login";
import Signup from "./Pages/auth/Signup";

// Common Components
import Loading from "./Pages/common/Loading";
import AppWrapper from "./Pages/common/AppWrapper";
import Navbar from "./Pages/common/Navbar";
import Home from "./Pages/common/Home";
import Library from "./Pages/common/Library";
import Profile from "./Pages/common/Profile";
import AuthPage from "./Pages/common/AuthPage";
import Footer from "./Pages/common/Footer";

function App() {
    const [activeComponent, setActiveComponent] = useState("Home");
    const [loading, setLoading] = useState(true);

    // Handle initial loading
    useEffect(() => {
        // Simulate initial app loading
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Handle component switching loading
    useEffect(() => {
        if (activeComponent !== "Home") {  // Only show loading for non-home components
            setLoading(true);
            const timer = setTimeout(() => {
                setLoading(false);
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [activeComponent]);

    const renderComponent = () => {
        switch (activeComponent) {
            case "Home":
                return <Home setActiveComponent={setActiveComponent} />;
            case "Library":
                return <Library />;
            case "Resources":
                return <Resources />;
            case "Stories":
                return <Stories />;
            case "StudyCircles":
                return <StudyCircles />;
            case "Leaderboard":
                return <Leaderboard />;
            case "UserProfile":
                return <UserProfile />;
            case "Profile":
                return <Profile />;
            default:
                return <Home setActiveComponent={setActiveComponent} />;
        }
    };

    const MainUI = () => (
        <div>
            <Navbar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
            <div className="container">
                {renderComponent()}
            </div>
            <Footer />
        </div>
    );

    return (
        <ThemeProvider>
            <AuthProvider>
                <CreditProvider>
                    <AppWrapper>
                        {loading && <Loading />}
                        <Routes>
                            <Route path="/" element={<MainUI />} />
                            <Route path="/resources" element={<MainUI />} />
                            <Route path="/stories" element={<MainUI />} />
                            <Route path="/circles" element={<MainUI />} />
                            <Route path="/leaderboard" element={<MainUI />} />
                            <Route path="/profile" element={<MainUI />} />
                            <Route path="/auth" element={<AuthPage />} />
                            
                            {/* Authentication Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            
                            {/* Protected Routes */}
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                            <Route path="/files" element={<ProtectedRoute><FileList /></ProtectedRoute>} />
                        </Routes>
                    </AppWrapper>
                </CreditProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;