import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "./AuthContext";
import Loading from "../Pages/common/Loading";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    
    // Render a loading spinner while AuthContext.loading is true
    if (loading) {
        return <Loading />;
    }
    
    // Only redirect to /login if AuthContext.loading is false and user is null
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

export default ProtectedRoute;