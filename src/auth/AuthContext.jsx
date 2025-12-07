import React, { createContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { getToken, setToken, removeToken } from "../utils/auth";

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
        const token = getToken();
        console.log('Checking for existing auth token:', token ? 'Found' : 'Not found');
        if (token) {
            // Verify token with backend
            authAPI.verify()
                .then(response => {
                    console.log('Token verification response:', response);
                    if (response.data && response.data.valid) {
                        setUser(response.data.user);
                        console.log('User authenticated:', response.data.user);
                    } else {
                        console.log('Token invalid, removing from localStorage');
                        removeToken();
                    }
                })
                .catch((error) => {
                    console.warn('Token verification failed:', error);
                    removeToken();
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
            const response = await authAPI.signup({ email, password, name });
            console.log('Signup successful, received token:', response.data.token ? 'Yes' : 'No');
            // Store token
            setToken(response.data.token);
            setUser(response.data.user);
            console.log('User set after signup:', response.data.user);
            return response.data.user;
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        }
    };

    const login = async (email, password) => {
        console.log('Attempting login for:', email);
        try {
            const response = await authAPI.login({ email, password });
            console.log('Login successful, received token:', response.data.token ? 'Yes' : 'No');
            // Store token
            setToken(response.data.token);
            setUser(response.data.user);
            console.log('User set after login:', response.data.user);
            return response.data.user;
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
                await authAPI.logout();
            } catch (error) {
                console.warn('Backend logout failed:', error);
            }
            
            // Clear token
            removeToken();
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