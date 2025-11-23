/* bookhive/src/components/Navbar.js */
import React from "react";

const Navbar = ({ activeComponent, setActiveComponent }) => {
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
        </nav>
    );
};

export default Navbar;
