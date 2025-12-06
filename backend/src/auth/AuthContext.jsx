import React, { createContext, useState, useEffect } from "react";
import apiClient from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('authToken');
        if (token) {
            // Verify token with backend
            apiClient.authAPI.verify()
                .then(response => {
                    if (response.valid) {
                        setUser(response.user);
                    } else {
                        localStorage.removeItem('authToken');
                    }
                })
                .catch(() => {
                    localStorage.removeItem('authToken');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const signup = async (email, password, name) => {
        try {
            const response = await apiClient.authAPI.signup({ email, password, name });
            // Store token
            localStorage.setItem('authToken', response.token);
            setUser(response.user);
            return response.user;
        } catch (error) {
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const response = await apiClient.authAPI.login({ email, password });
            // Store token
            localStorage.setItem('authToken', response.token);
            setUser(response.user);
            return response.user;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Logout from our backend
            try {
                await apiClient.authAPI.logout();
            } catch (error) {
                console.warn('Backend logout failed:', error);
            }
            
            // Clear token
            localStorage.removeItem('authToken');
            setUser(null);
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        signup,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;