/* bookhive/src/components/Navbar.js */
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthContext";
import ThemeToggle from "./ThemeToggle";
import "../styles/Navbar.css";

const Navbar = ({ activeComponent, setActiveComponent }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [query, setQuery] = useState("");

    const handleLogout = () => {
        logout();
        navigate("/auth");
    };

    const submitSearch = (e) => {
        e && e.preventDefault();
        // Save search to session so Library can read it on activation
        sessionStorage.setItem("bh_search", query || "");
        setActiveComponent("Library");
    };

    return (
        <nav className="navbar-container">
            <div className="navbar-wrapper">
                <div className="navbar-left">
                    <div
                        className="navbar-logo"
                        onClick={() => {
                            setActiveComponent("Home");
                            navigate("/");
                        }}
                    >
                        📚 BookHive
                    </div>

                    <div className="navbar-links">
                        <button className="navbar-link" onClick={() => setActiveComponent("Home")}>Home</button>
                        <button className="navbar-link" onClick={() => setActiveComponent("Resources")}>Resources</button>
                        <button className="navbar-link" onClick={() => setActiveComponent("Stories")}>Stories</button>
                        <button className="navbar-link" onClick={() => setActiveComponent("StudyCircles")}>Circles</button>
                        <button className="navbar-link" onClick={() => setActiveComponent("Leaderboard")}>Leaderboard</button>

                        <div className="nav-dropdown">
                            <button className="navbar-link">More ▾</button>
                            <div className="dropdown-menu">
                                <div className="dropdown-item" onClick={() => setActiveComponent("Library")}>📚 Library</div>
                                <div className="dropdown-item" onClick={() => setActiveComponent("Upload")}>📤 Upload</div>
                                <div className="dropdown-item" onClick={() => setActiveComponent("UserProfile")}>👤 Profile</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="navbar-right">
                    <form className="navbar-search" onSubmit={submitSearch}>
                        <input aria-label="Search books" placeholder="Search resources..." value={query} onChange={(e) => setQuery(e.target.value)} />
                        <button className="btn btn-ghost" type="submit">🔍</button>
                    </form>

                    <ThemeToggle />

                    {user ? (
                        <>
                            <button className="navbar-btn navbar-btn-primary" onClick={() => navigate("/dashboard")}>Dashboard</button>
                            <button className="navbar-btn navbar-btn-secondary" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <button className="navbar-btn navbar-btn-primary" onClick={() => navigate("/auth")}>Login / Signup</button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
