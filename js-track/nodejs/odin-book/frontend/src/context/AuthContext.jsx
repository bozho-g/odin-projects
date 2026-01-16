import { useEffect, useState } from "react";
import { api } from "../api/apiClient";
import { createContext } from "react";
import { useContext } from "react";
import { useLoginMutation } from "../hooks/useLoginMutation";
import { useRegisterMutation } from "../hooks/useRegisterMutation";
import { useUploadProfilePicture } from "../hooks/useUploadProfilePicture";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const loginMutation = useLoginMutation();
    const registerMutation = useRegisterMutation();
    const uploadProfilePictureMutation = useUploadProfilePicture();

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await api.get('/users/me');
                setUser(response);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    const login = async (credentials) => {
        const response = await loginMutation.mutateAsync(credentials);
        setUser(response);
        return response;
    };

    const register = async (details) => {
        const me = await registerMutation.mutateAsync(details);
        setUser(me);
        return me;
    };

    const logout = async () => {
        await api.post('/users/logout');
        setUser(null);
    };

    const uploadProfilePicture = async (file, usernameOverride) => {
        const tempUrl = URL.createObjectURL(file);
        setUser(prev => ({ ...prev, pfpUrl: tempUrl }));

        try {
            const { pictureUrl, picturePublicId } = await uploadProfilePictureMutation.mutateAsync({ file, signUrl: '/cloudinary/sign/profile' });

            await updateProfile({ pfpUrl: pictureUrl, pfpPublicId: picturePublicId, username: usernameOverride ?? user?.username });
        } catch (err) {
            setUser(prev => ({ ...prev, pfpUrl: user?.pfpUrl }));
            throw err;
        }
    };

    const updateProfile = async (payload) => {
        const updated = await api.put('/users/me', payload);
        setUser(updated);
        return updated;
    };

    const isLoading = loading || loginMutation.isPending || registerMutation.isPending || uploadProfilePictureMutation.isPending;

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, uploadProfilePicture, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}