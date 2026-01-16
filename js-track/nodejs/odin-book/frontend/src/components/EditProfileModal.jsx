import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./Elements/Button/Button";
import { Modal } from "./Modal/Modal";
import styles from "../components/AuthModal/AuthModal.module.css";
import { isInvalidImageFile } from "../utils/files";
import { useLocation, useNavigate } from "react-router-dom";

const DEFAULT_PFP_URL = import.meta.env.VITE_DEFAULT_PFP_URL;

export function EditProfileModal({ isOpen, onClose }) {
    const { uploadProfilePicture, updateProfile, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [errors, setErrors] = useState([]);
    const [pfpUrl, setPfpUrl] = useState(user?.pfpUrl || DEFAULT_PFP_URL);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    function handleClose() {
        setErrors([]);
        onClose();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target);
        const username = formData.get("username");

        const errorsLocal = [];
        if (username.length < 1) {
            errorsLocal.push("Username must be at least 1 character long.");
        }

        if (selectedFile) {
            const fileError = isInvalidImageFile(selectedFile);
            if (fileError) {
                errorsLocal.push(fileError);
            }
        }

        setErrors(errorsLocal);
        if (errorsLocal.length > 0) {
            setIsLoading(false);
            return;
        }

        try {
            const oldUsername = user?.username;
            const payload = {};
            if (username !== user?.username) {
                payload.username = username;
            }

            if (pfpUrl === DEFAULT_PFP_URL) {
                payload.pfpUrl = null;
                payload.pfpPublicId = null;
            }

            if (Object.keys(payload).length > 0) {
                await updateProfile(payload);
            }

            if (selectedFile) {
                await uploadProfilePicture(selectedFile, username);
            }

            if (oldUsername && payload.username && payload.username !== oldUsername) {
                const oldPrefix = `/profile/${oldUsername}`;
                if (location.pathname.startsWith(oldPrefix)) {
                    const suffix = location.pathname.slice(oldPrefix.length);
                    navigate(`/profile/${payload.username}${suffix}`, { replace: true });
                }
            }

            onClose();
        } catch (err) {
            const errorMessages = err.errors || [err.message || 'Auth failed. Please try again.'];
            setErrors(errorMessages);
        } finally {
            setIsLoading(false);
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const fileError = isInvalidImageFile(file);
        if (fileError) {
            setErrors([fileError]);
            setSelectedFile(null);
            return;
        }

        setErrors([]);
        const tempUrl = URL.createObjectURL(file);
        setSelectedFile(file);
        setPfpUrl(tempUrl);
    };

    return (
        <Modal title="Edit profile" isOpen={isOpen} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <div className={styles.inputBox}>
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" required defaultValue={user?.username} />
                </div>

                <label>Avatar Preview</label>
                <div className={styles.avatarPreview}>
                    <img src={pfpUrl} alt="avatar preview" />
                    <div className={styles.avatarButtons}>
                        <label htmlFor="pfpFile" className={styles.uploadLabel}>Upload New
                            <input type="file" id="pfpFile" name="pfpFile" accept="image/*" hidden onChange={handleFileChange} />
                        </label>
                        <Button variant="outline" onClick={() => setPfpUrl(DEFAULT_PFP_URL)} type="button">
                            Remove Avatar
                        </Button>
                    </div>
                </div>


                <Button disabled={isLoading} type="submit">{isLoading ? "Saving..." : "Save Changes"}</Button>
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
