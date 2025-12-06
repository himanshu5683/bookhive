import React, { createContext, useState, useEffect } from "react";
import apiClient from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Update user credits
    const updateUserCredits = (newCredits) => {
        if (user) {
            setUser(prevUser => ({
                ...prevUser,
                credits: newCredits
            }));
        }
    };

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('authToken');
        console.log('Checking for existing auth token:', token ? 'Found' : 'Not found');
        if (token) {
            // Verify token with backend
            apiClient.authAPI.verify()
                .then(response => {
                    console.log('Token verification response:', response);
                    if (response.valid) {
                        setUser(response.user);
                        console.log('User authenticated:', response.user);
                    } else {
                        console.log('Token invalid, removing from localStorage');
                        localStorage.removeItem('authToken');
                    }
                })
                .catch((error) => {
                    console.warn('Token verification failed:', error);
                    localStorage.removeItem('authToken');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            console.log('No auth token found, setting loading to false');
            setLoading(false);
        }
    }, []);

    const signup = async (email, password, name) => {
        console.log('Attempting signup for:', email);
        try {
            const response = await apiClient.authAPI.signup({ email, password, name });
            console.log('Signup successful, received token:', response.token ? 'Yes' : 'No');
            // Store token
            localStorage.setItem('authToken', response.token);
            setUser(response.user);
            console.log('User set after signup:', response.user);
            return response.user;
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        }
    };

    const login = async (email, password) => {
        console.log('Attempting login for:', email);
        try {
            const response = await apiClient.authAPI.login({ email, password });
            console.log('Login successful, received token:', response.token ? 'Yes' : 'No');
            // Store token
            localStorage.setItem('authToken', response.token);
            setUser(response.user);
            console.log('User set after login:', response.user);
            return response.user;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    // Social login handler
    const socialLogin = async (provider) => {
        console.log(`Initiating ${provider} login`);
        
        // Redirect to OAuth endpoint
        window.location.href = `${process.env.REACT_APP_API_URL.replace('/api', '')}/api/oauth/${provider}`;
    };

    const logout = async () => {
        console.log('Logging out user');
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
            console.log('User logged out and token cleared');
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    };

    const value = {
        user,
        signup,
        login,
        socialLogin,
        logout,
        loading,
        updateUserCredits
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;