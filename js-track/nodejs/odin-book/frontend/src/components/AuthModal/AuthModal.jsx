import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../Elements/Button/Button";
import { Modal } from "../Modal/Modal";
import styles from "./AuthModal.module.css";
import { useNavigate } from "react-router-dom";
import { isInvalidImageFile } from "../../utils/files";

export function AuthModal({ isSignIn, isOpen, onClose }) {
    const { login, register, isLoading, uploadProfilePicture } = useAuth();
    const [errors, setErrors] = useState([]);

    const navigate = useNavigate();

    function handleClose() {
        setErrors([]);
        onClose();
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const username = formData.get("username");
        const password = formData.get("password");
        const file = formData.get("pfpFile");
        const confirmPassword = formData.get("confirmPassword");

        const errorsLocal = [];
        if (username.length < 1) {
            errorsLocal.push("Username must be at least 1 character long.");
        }

        if (password.length < 6) {
            errorsLocal.push("Password must be at least 6 characters long.");
        }

        if (!isSignIn && password !== confirmPassword) {
            errorsLocal.push("Passwords do not match.");
        }

        if (!isSignIn && file && file.size > 0) {
            const fileError = isInvalidImageFile(file);
            if (fileError) {
                errorsLocal.push(fileError);
            }
        }

        setErrors(errorsLocal);
        if (errorsLocal.length > 0) {
            return;
        }

        try {
            if (isSignIn) {
                await login({ username, password });
                navigate("/");
                return;
            }

            const me = await register({ username, password, confirmPassword });

            if (file?.size > 0) {
                await uploadProfilePicture(file, me?.username);
            }

            navigate("/");
        } catch (err) {
            const errorMessages = err.errors || [err.message || 'Auth failed. Please try again.'];
            setErrors(errorMessages);
        }
    }

    return (
        <Modal title={isSignIn ? "Sign In" : "Register"} isOpen={isOpen} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <div className={styles.inputBox}>
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" required />
                </div>

                <div className={styles.inputBox}>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" required />
                </div>
                {isSignIn ? (
                    <></>
                ) : (
                    <>
                        <div className={styles.inputBox}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input type="password" name="confirmPassword" required />
                        </div>

                        <div className={styles.inputBox}>
                            <label htmlFor="pfpFile">Profile Picture (optional)</label>
                            <input type="file" id="pfpFile" name="pfpFile" accept="image/*" />
                        </div>
                    </>
                )}

                <Button disabled={isLoading} type="submit">{isLoading ? "Loading..." : isSignIn ? "Sign In" : "Register"}</Button>
            </form>

            {errors.length > 0 && (
                <div className={styles.errorBox}>
                    {errors.map((error, index) => (
                        <p key={index} className={styles.errorMessage}>{error}</p>
                    ))}
                </div>
            )}
        </Modal >
    );
}
