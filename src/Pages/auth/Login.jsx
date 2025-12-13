import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";
import SocialAuthButton from "../../components/SocialAuthButton";
import "../../styles/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, socialLogin, user } = useContext(AuthContext);

  // Check for OAuth errors in URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get('error');
    if (oauthError) {
      setError(decodeURIComponent(oauthError));
    }
  }, [location]);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log('Login form submitted');

    // Validation
    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      console.log('Calling login function with:', { email, password });
      // Sign in through our AuthContext (uses backend API)
      await login(email, password);
      console.log('Login successful, redirecting to dashboard');
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error('Login error:', err);
      // Handle backend API errors
      try {
        // Try to parse detailed error message
        const errorObj = JSON.parse(err.message);
        console.log('Parsed error object:', errorObj);
        if (errorObj.status) {
          // Server-side errors
          if (errorObj.status === 401) {
            setError("Invalid email or password");
          } else if (errorObj.status === 500) {
            setError("Server error. Please try again later.");
          } else {
            setError(`Login failed (${errorObj.status}): ${errorObj.message}`);
          }
        } else if (errorObj.message) {
          // Check if it's a network error
          if (errorObj.message.includes("Network error") || errorObj.message.includes("Unable to connect")) {
            setError("Unable to connect to the server. Please check your network connection.");
          } else {
            setError(errorObj.message);
          }
        } else {
          setError("Failed to log in: " + err.message);
        }
      } catch (parseErr) {
        // If parsing fails, use original message
        const errorMessage = err.message || "Failed to log in";
        console.log('Error message that could not be parsed:', errorMessage);
        if (errorMessage.includes("Network")) {
          setError("Unable to connect to the server. Please check your network connection.");
        } else if (errorMessage.includes("Invalid credentials")) {
          setError("Invalid email or password");
        } else if (errorMessage.includes("not found")) {
          setError("No account found with this email");
        } else {
          setError(errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError("");
    setSocialLoading(provider);
    console.log(`Social login with ${provider} initiated`);

    try {
      await socialLogin(provider);
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setError(err.message || `Failed to login with ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue your learning journey</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <div className="alert-title">Login Error</div>
                <div className="alert-description">{error}</div>
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email" className="label">Email Address</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="label">
                <span>Password</span>
                <button 
                  type="button" 
                  className="btn btn-icon btn-ghost password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                className="btn btn-link"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="divider">or continue with</div>

          <div className="social-auth-buttons">
            <SocialAuthButton 
              provider="google" 
              onClick={() => handleSocialLogin('google')}
              disabled={loading || socialLoading}
              loading={socialLoading === 'google'}
            />
            <SocialAuthButton 
              provider="github" 
              onClick={() => handleSocialLogin('github')}
              disabled={loading || socialLoading}
              loading={socialLoading === 'github'}
            />
            <SocialAuthButton 
              provider="facebook" 
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading || socialLoading}
              loading={socialLoading === 'facebook'}
            />
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <button 
                className="btn btn-link"
                onClick={() => navigate("/signup")}
                disabled={loading}
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;