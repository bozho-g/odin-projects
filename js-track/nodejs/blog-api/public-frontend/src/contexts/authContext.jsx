import { createContext, useState, useEffect } from "react";
import { login as apiLogin, logout as apiLogout, register as apiRegister } from "../api/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'user') {
                try {
                    setUser(e.newValue ? JSON.parse(e.newValue) : null);
                } catch (err) {
                    console.error('Error parsing user from storage event', err);
                    setUser(null);
                }
            }
        };

        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const login = async (username, password) => {
        const user = await apiLogin(username, password);
        setUser(user);
    };

    const register = async (username, password, confirmPassword) => {
        const user = await apiRegister(username, password, confirmPassword);
        setUser(user);
    };

    const logout = async () => {
        await apiLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;