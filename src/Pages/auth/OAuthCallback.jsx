import React, { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userData = params.get('user');

    if (token && userData) {
      try {
        // Store token in localStorage
        localStorage.setItem('authToken', token);
        
        // Parse user data
        const user = JSON.parse(decodeURIComponent(userData));
        
        // Set user in context
        setUser(user);
        
        // Redirect to dashboard
        navigate("/dashboard");
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        // Redirect to login with error
        navigate("/login?error=Invalid OAuth response");
      }
    } else {
      // Redirect to login with error
      navigate("/login?error=Missing OAuth credentials");
    }
  }, [location, navigate, setUser]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Processing Login...</h1>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;