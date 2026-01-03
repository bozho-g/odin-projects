import { createContext, useContext, useState, useEffect } from "react";
import { api, setOnUnauthorized } from "../util/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setOnUnauthorized(() => {
            setUser(null);
        });

        async function fetchCurrentUser() {
            try {
                const me = await api.get('/auth/me');
                setUser(me);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        fetchCurrentUser();
    }, []);

    const login = async (credentials) => {
        const me = await api.post('/auth/login', credentials);
        setUser(me);
        return me;
    };

    const register = async (details) => {
        const me = await api.post('/auth/register', details);
        setUser(me);
        return me;
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}