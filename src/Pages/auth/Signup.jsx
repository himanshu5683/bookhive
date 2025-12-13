import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";
import SocialAuthButton from "../../components/SocialAuthButton";
import "../../styles/Auth.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, socialLogin, user } = useContext(AuthContext);

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

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log('Signup form submitted');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      console.log('Calling signup function with:', { email, password, name });
      // Create user through our AuthContext (uses backend API)
      await signup(email, password, name);
      console.log('Signup successful, redirecting to dashboard');
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error('Signup error:', err);
      // Handle backend API errors
      try {
        // Try to parse detailed error message
        const errorObj = JSON.parse(err.message);
        if (errorObj.status) {
          // Server-side errors
          if (errorObj.status === 400) {
            if (errorObj.message.includes("exists")) {
              setError("Email is already registered");
            } else if (errorObj.message.includes("email")) {
              setError("Please enter a valid email address");
            } else if (errorObj.message.includes("Password")) {
              setError("Password must be at least 6 characters");
            } else {
              setError("Invalid input. Please check your details.");
            }
          } else if (errorObj.status === 500) {
            setError("Server error. Please try again later.");
          } else {
            setError(`Signup failed (${errorObj.status}): ${errorObj.message}`);
          }
        } else if (errorObj.message) {
          // Check if it's a network error
          if (errorObj.message.includes("Network error") || errorObj.message.includes("Unable to connect")) {
            setError("Unable to connect to the server. Please check your network connection.");
          } else {
            setError(errorObj.message);
          }
        } else {
          setError("Failed to create account: " + err.message);
        }
      } catch (parseErr) {
        // If parsing fails, use original message
        const errorMessage = err.message || "Failed to create account";
        if (errorMessage.includes("already exists")) {
          setError("Email is already registered");
        } else if (errorMessage.includes("Invalid email") || errorMessage.includes("Valid email")) {
          setError("Please enter a valid email address");
        } else if (errorMessage.includes("Password") || errorMessage.includes("6 characters")) {
          setError("Password must be at least 6 characters");
        } else if (errorMessage.includes("Network")) {
          setError("Unable to connect to the server. Please check your network connection.");
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join BookHive and start learning</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <div className="alert-title">Signup Error</div>
                <div className="alert-description">{error}</div>
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSignup}>
            <div className="form-group">
              <label htmlFor="name" className="label">Full Name</label>
              <input
                id="name"
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
                autoComplete="name"
              />
            </div>

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
                  placeholder="Create a password"
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="label">
                <span>Confirm Password</span>
                <button 
                  type="button" 
                  className="btn btn-icon btn-ghost password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                "Sign Up"
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
              Already have an account?{" "}
              <button 
                className="btn btn-link"
                onClick={() => navigate("/login")}
                disabled={loading}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;