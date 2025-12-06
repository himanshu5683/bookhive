import React, { useContext } from "react";
import AuthContext from "../../auth/AuthContext";
import Loading from "./Loading";

const AppWrapper = ({ children }) => {
    const { loading } = useContext(AuthContext);
    
    // Show loading spinner while auth state is being determined
    if (loading) {
        return <Loading />;
    }
    
    // Render children once auth state is determined
    return children;
};

export default AppWrapper;