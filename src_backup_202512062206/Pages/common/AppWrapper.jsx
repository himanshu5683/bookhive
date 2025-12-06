import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import Loading from "./Loading";
import AuthContext from "../../auth/AuthContext";

const AppWrapper = ({ children }) => {
    const { loading } = useContext(AuthContext);
    const location = useLocation();
    
    // Don't show loading spinner on auth routes (/login, /signup)
    const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';
    
    // Show loading spinner while auth state is being determined (except on auth routes)
    if (loading && !isAuthRoute) {
        return <Loading />;
    }
    
    // Render children once auth state is determined
    return children;
};

export default AppWrapper;