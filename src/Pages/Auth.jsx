import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (isLogin) {
            // Login
            if (!email || !password) {
                setError("Email and password are required");
                return;
            }
            const user = { email };
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/dashboard", { replace: true });
        } else {
            // Signup
            if (!fullName || !email || !password || !confirmPassword) {
                setError("All fields are required");
                return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            const user = { name: fullName, email };
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/dashboard", { replace: true });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-tabs">
                    <button
                        className={`tab ${isLogin ? "active" : ""}`}
                        onClick={() => {
                            setIsLogin(true);
                            setError("");
                            setFullName("");
                            setEmail("");
                            setPassword("");
                            setConfirmPassword("");
                        }}
                    >
                        Login
                    </button>
                    <button
                        className={`tab ${!isLogin ? "active" : ""}`}
                        onClick={() => {
                            setIsLogin(false);
                            setError("");
                            setFullName("");
                            setEmail("");
                            setPassword("");
                            setConfirmPassword("");
                        }}
                    >
                        Sign Up
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName"
                                type="text"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    )}

                    <button type="submit" className="submit-btn">
                        {isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>

                <button className="home-btn" onClick={() => navigate("/")}>
                    Return to Home
                </button>
            </div>
        </div>
    );
};

export default Auth;
