import React, { createContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch (e) {
            return null;
        }
    });

    const signup = (email, password) => {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.find(u => u.email === email)) {
            throw new Error("User already exists");
        }
        const newUser = { email, password };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        const publicUser = { email };
        localStorage.setItem("user", JSON.stringify(publicUser));
        setUser(publicUser);
    };

    const login = (email, password) => {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const found = users.find(u => u.email === email && u.password === password);
        if (!found) {
            throw new Error("Invalid credentials");
        }
        const publicUser = { email };
        localStorage.setItem("user", JSON.stringify(publicUser));
        setUser(publicUser);
    };

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, signup, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
