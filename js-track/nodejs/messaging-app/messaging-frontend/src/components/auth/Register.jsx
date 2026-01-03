import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { useState } from "react";
import { uploadWithSignedUrl } from "../../util/supabase";
import { api } from "../../util/api";

export default function Register() {
    const { register, setUser } = useAuth();
    const [errors, setErrors] = useState([]);

    let navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        const username = e.target.username.value.trim();
        const displayName = e.target.displayName.value.trim();
        const password = e.target.password.value.trim();
        const confirmPassword = e.target.confirmPassword.value.trim();
        const file = e.target.pfpFile.files[0];

        const errorsLocal = [];
        if (username.length < 4) {
            errorsLocal.push("Username must be at least 4 characters long.");
        }

        if (displayName.length < 4) {
            errorsLocal.push("Display name must be at least 4 characters long.");
        }

        if (password.length < 6) {
            errorsLocal.push("Password must be at least 6 characters long.");
        }

        if (password !== confirmPassword) {
            errorsLocal.push("Passwords do not match.");
        }

        setErrors(errorsLocal);
        if (errorsLocal.length > 0) {
            return;
        }

        try {
            const me = await register({ username, password, displayName, confirmPassword });

            if (file) {
                const tempUrl = URL.createObjectURL(file);
                setUser({ ...me, pfpUrl: tempUrl });
            } else {
                setUser(me);
            }

            if (file) {
                try {
                    const signed = await api.post('/auth/avatar-signed-url', {
                        filename: file.name,
                        mime: file.type,
                    });
                    if (signed?.token) {
                        const pfpUrl = await uploadWithSignedUrl(file, signed);
                        const updated = await api.patch('/auth/profile', { displayName, pfpUrl });
                        setUser(updated);
                    }
                } catch (err) {
                    console.warn('Avatar upload failed:', err);
                }
            }

            navigate('/');
        } catch (err) {
            const errorMessages = err.errors || [err.message || 'Registration failed. Please try again.'];
            setErrors(errorMessages);
        }
    };

    return (
        <div>
            <form className="form" onSubmit={handleRegister}>
                <div className="input-box">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" required minLength={4} />
                </div>

                <div className="input-box">
                    <label htmlFor="displayName">Display name</label>
                    <input type="text" id="displayName" name="displayName" required minLength={4} />
                </div>

                <div className="input-box">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" required minLength={6} />
                </div>

                <div className="input-box">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required minLength={6} />
                </div>

                <div className="input-box">
                    <label htmlFor="pfpFile">Profile Picture (optional)</label>
                    <input type="file" id="pfpFile" name="pfpFile" accept="image/*" />
                </div>

                <button type="submit" className="primary btn">Create account</button>
            </form>
            {errors.length > 0 && (
                <div className="error-messages">
                    {errors.map((error, index) => (
                        <p className="error" key={index}>{error}</p>
                    ))}
                </div>
            )}
        </div>
    );
}
