/* bookhive/src/App.js */
import React, { useState, useEffect } from "react";
import Loading from "./components/Loading";
import AppWrapper from "./components/AppWrapper";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Library from "./components/Library";
import Profile from "./components/Profile";
import "./styles/styles.css";

import { AuthProvider } from "./auth/AuthContext";
import { CreditProvider } from "./context/CreditContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AuthPage from "./components/AuthPage";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import Stories from "./pages/Stories";
import StudyCircles from "./pages/StudyCircles";
import Leaderboard from "./pages/Leaderboard";
import UserProfile from "./pages/UserProfile";
import Footer from "./components/Footer";
import "./styles/Footer.css";

// Firebase Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Upload from "./pages/Upload";
import FileList from "./pages/FileList";

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
                            
                            {/* Firebase Authentication Routes */}
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