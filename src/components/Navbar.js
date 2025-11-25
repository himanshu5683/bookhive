/* bookhive/src/components/Navbar.js */
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthContext";
import "../styles/Navbar.css";

const Navbar = ({ activeComponent, setActiveComponent }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/auth");
    };


    return (
        <nav className="navbar-container">
            <div className="navbar-wrapper">
                <div className="navbar-left">
                    <div className="navbar-logo" onClick={() => navigate("/")}>
                        BookHive
                    </div>
                    <div className="navbar-links">
                        <button className="navbar-link" onClick={() => setActiveComponent("Home")}>Home</button>
                        <button className="navbar-link" onClick={() => setActiveComponent("Library")}>Library</button>
                        <button className="navbar-link" onClick={() => setActiveComponent("Upload")}>Upload</button>
                        <button className="navbar-link" onClick={() => setActiveComponent("Profile")}>Profile</button>
                    </div>
                </div>

                <div className="navbar-right">
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
