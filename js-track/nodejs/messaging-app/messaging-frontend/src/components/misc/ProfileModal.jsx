import { useRef, useState } from "react";
import { api } from "../../util/api";
import { useAuth } from "../../contexts/authContext";
import { uploadWithSignedUrl } from "../../util/supabase";
import { toast } from 'sonner';
import Modal from "../common/Modal";

function ProfileModal({ onClose }) {
    const { user, setUser } = useAuth();
    const originalPfpRef = useRef(user.pfpUrl || "");
    const [errors, setErrors] = useState([]);
    const fallbackPfpUrl = import.meta.env.VITE_DEFAULT_PFP_URL;

    const [displayName, setDisplayName] = useState(user.displayName || '');
    const [pfpUrl, setPfpUrl] = useState(user.pfpUrl || '');
    const [previewUrl, setPreviewUrl] = useState(user.pfpUrl || '');
    const [selectedFile, setSelectedFile] = useState(null);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        toast.loading('Updating profile...');
        let nextPfpUrl = pfpUrl;

        try {
            if (selectedFile) {
                const signed = await api.post('/auth/avatar-signed-url', {
                    filename: selectedFile.name,
                    mime: selectedFile.type,
                });
                if (!signed?.bucket || !signed?.path || !signed?.token) {
                    throw new Error("Failed to get upload token");
                }
                nextPfpUrl = await uploadWithSignedUrl(selectedFile, signed);
                setPfpUrl(nextPfpUrl);
            }

            const updated = await api.patch('/auth/profile', {
                displayName,
                pfpUrl: nextPfpUrl
            });
            setUser(updated);

            const original = originalPfpRef.current;
            const supabaseUrlPattern = /supabase\.co\/storage/i;

            if (original && original !== nextPfpUrl && supabaseUrlPattern.test(original)) {
                try {
                    await api.delete('/auth/delete-avatar', { url: original });
                } catch (err) {
                    console.warn('Failed to delete old avatar:', err);
                }
            }

            onClose();
        } catch (err) {
            const msgs = err.data?.errors || [err.message || 'Failed to update profile'];
            setErrors(msgs);
        } finally {
            setSelectedFile(null);
            toast.dismiss();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const clearAvatar = () => {
        setPfpUrl("");
        setPreviewUrl("");
        setSelectedFile(null);
    };

    return (
        <Modal title="Edit profile" onClose={onClose}>
            <div className="avatar-preview">
                <img src={previewUrl || fallbackPfpUrl} alt="avatar preview" />

                <div className="avatar-actions">
                    <label className="secondary-btn upload-btn">
                        Upload new
                        <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                    </label>
                    <button type="button" className="secondary-btn" onClick={clearAvatar}>
                        Use default
                    </button>
                </div>
            </div>

            <form onSubmit={onSubmit} className="form">
                <div className="input-box">
                    <label htmlFor="displayName">Display name</label>
                    <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required minLength={4} />
                </div>

                <div className="form-actions">
                    <button type="submit" className="primary btn">Save</button>
                    <button type="button" className="secondary-btn cancel-btn" onClick={onClose}>Cancel</button>
                </div>
            </form>

            {errors.length > 0 && <div className="error-messages">{errors.map((m) => <p key={m}>{m}</p>)}</div>}
        </Modal>
    );
}

export default ProfileModal;
