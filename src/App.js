/* bookhive/src/App.js */
import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Library from "./components/Library";
import Upload from "./components/Upload";
import Profile from "./components/Profile";
import "./styles/styles.css";

function App() {
    const [activeComponent, setActiveComponent] = useState("Home");

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

    return (
        <div>
            <Navbar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
            <div className="container">
                {renderComponent()}
            </div>
        </div>
    );
}

export default App;
