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
    const [mobileOpen, setMobileOpen] = useState(false);

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

                    <div className="nav-links">
                        <button className="navbar-link" onClick={() => setActiveComponent("Home")}>Home</button>
                        <button className="navbar-link" onClick={() => setActiveComponent("Resources")}>Resources</button>
                        <button className="navbar-link" onClick={() => setActiveComponent("Stories")}>Stories</button>
                        <button className="navbar-link" onClick={() => setActiveComponent("StudyCircles")}>Community</button>
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

                <form className="navbar-search" onSubmit={submitSearch}>
                    <input aria-label="Search books" placeholder="Search resources..." value={query} onChange={(e) => setQuery(e.target.value)} />
                    <button className="btn btn-ghost" type="submit">🔍</button>
                </form>

                <div className="navbar-right">
                    <ThemeToggle />

                    {user ? (
                        <>
                            <button className="navbar-btn navbar-btn-primary" onClick={() => navigate("/dashboard")}>Dashboard</button>
                            <button className="navbar-btn navbar-btn-secondary" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <button className="navbar-btn navbar-btn-primary" onClick={() => navigate("/auth")}>Login / Signup</button>
                    )}

                    <button
                        className="mobile-toggle"
                        aria-label="Toggle menu"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        ☰
                    </button>
                </div>

                {mobileOpen && (
                    <div className="mobile-menu">
                        <div className="mobile-group">
                            <button className="navbar-link" onClick={() => { setActiveComponent("Home"); setMobileOpen(false); }}>Home</button>
                            <button className="navbar-link" onClick={() => { setActiveComponent("Resources"); setMobileOpen(false); }}>Resources</button>
                            <button className="navbar-link" onClick={() => { setActiveComponent("Stories"); setMobileOpen(false); }}>Stories</button>
                            <button className="navbar-link" onClick={() => { setActiveComponent("StudyCircles"); setMobileOpen(false); }}>Circles</button>
                            <button className="navbar-link" onClick={() => { setActiveComponent("Leaderboard"); setMobileOpen(false); }}>Leaderboard</button>
                            <div className="nav-dropdown-mobile">
                                <div className="dropdown-item" onClick={() => { setActiveComponent("Library"); setMobileOpen(false); }}>📚 Library</div>
                                <div className="dropdown-item" onClick={() => { setActiveComponent("Upload"); setMobileOpen(false); }}>📤 Upload</div>
                                <div className="dropdown-item" onClick={() => { setActiveComponent("UserProfile"); setMobileOpen(false); }}>👤 Profile</div>
                            </div>
                        </div>

                        <div className="mobile-group">
                            <form className="navbar-search" onSubmit={(e) => { submitSearch(e); setMobileOpen(false); }}>
                                <input aria-label="Search books" placeholder="Search resources..." value={query} onChange={(e) => setQuery(e.target.value)} />
                                <button className="btn btn-ghost" type="submit">🔍</button>
                            </form>
                        </div>

                        <div className="mobile-group mobile-actions">
                            <ThemeToggle />
                            {user ? (
                                <>
                                    <button className="navbar-btn navbar-btn-primary" onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}>Dashboard</button>
                                    <button className="navbar-btn navbar-btn-secondary" onClick={() => { handleLogout(); setMobileOpen(false); }}>Logout</button>
                                </>
                            ) : (
                                <button className="navbar-btn navbar-btn-primary" onClick={() => { navigate("/auth"); setMobileOpen(false); }}>Login / Signup</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
