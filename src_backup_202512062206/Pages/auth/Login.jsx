import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";
import "../../styles/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      // Sign in through our AuthContext (uses backend API)
      await login(email, password);
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      // Handle backend API errors
      const errorMessage = err.message || "Failed to log in";
      if (errorMessage.includes("Invalid credentials")) {
        setError("Invalid email or password");
      } else if (errorMessage.includes("not found")) {
        setError("No account found with this email");
      } else if (errorMessage.includes("Network")) {
        setError("Network error. Please check your connection.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue your learning journey</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn" 
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <button 
              className="auth-link" 
              onClick={() => navigate("/signup")}
              disabled={loading}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;