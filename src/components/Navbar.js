/* bookhive/src/components/Navbar.js */
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthContext";

const Navbar = ({ activeComponent, setActiveComponent }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-title">BookHive</div>

            <div className="navbar-links">
                {["Home", "Library", "Upload", "Profile"].map(page => (
                    <button
                        key={page}
                        className={activeComponent === page ? "active nav-button" : "nav-button"}
                        onClick={() => setActiveComponent(page)}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <div className="navbar-auth">
                {user ? (
                    <>
                        <button className="nav-button" onClick={() => navigate("/dashboard")}>Dashboard</button>
                        <button className="nav-button" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <button className="nav-button" onClick={() => navigate("/auth")}>Auth</button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
