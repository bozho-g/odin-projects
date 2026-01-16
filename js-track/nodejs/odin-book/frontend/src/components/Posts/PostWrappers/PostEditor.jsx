import styles from "./PostEditor.module.css";
import iconsUrl from "../../../assets/icons.svg?url";
import { useEffect, useState, useId } from "react";
import { Button } from "../../Elements/Button/Button";
import { isInvalidImageFile } from "../../../utils/files";
import { TextBox } from "../../Elements/TextBox/TextBox";

export function PostEditor({ initialContent = "", initialImageUrl = null, submitLabel = "Post", onSubmit, isLoading = false, placeholder = "What's on your mind?", onCancel }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState(initialImageUrl);
    const [message, setMessage] = useState(initialContent);

    const selectedUrl = selectedFile && !isInvalidImageFile(selectedFile) ?
        URL.createObjectURL(selectedFile) :
        selectedImageUrl;

    useEffect(() => {
        if (!selectedUrl) return;
        return () => URL.revokeObjectURL(selectedUrl);
    }, [selectedUrl]);

    async function handleSubmit(e) {
        e.preventDefault();
        const imageChanged = (selectedImageUrl !== initialImageUrl) || !!selectedFile;
        onSubmit({ content: message.trim(), file: selectedFile, imageUrl: selectedImageUrl, imageChanged });
    }

    const inputId = useId();

    return (
        <form className={styles.postForm} onSubmit={handleSubmit}>
            <TextBox value={message} onChange={setMessage} placeholder={placeholder} />

            {selectedUrl && (
                <div className={styles.selectedPictureContainer}>
                    <button type="button" className={styles.removePictureButton} onClick={() => { setSelectedFile(null); setSelectedImageUrl(null); }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href={`${iconsUrl}#icon-close`} /></svg>
                    </button>
                    <img className={styles.selectedPicture} src={selectedUrl} alt="" />
                </div>
            )}

            <div className={styles.formActions}>
                <label htmlFor={inputId}>
                    <svg viewBox="0 0 20 20" focusable="false"><use href={`${iconsUrl}#icon-image`} /></svg>
                    <input name="imgUpload" type="file" id={inputId} className={styles.fileInput} hidden accept="image/*" onChange={(e) => { e.stopPropagation(); setSelectedFile(e.target.files[0]); }} />
                </label>
                <div className={styles.actionButtons}>
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button disabled={!message.trim() && !selectedFile && !selectedImageUrl || isLoading} className={styles.postButton}>
                        {isLoading ? `Posting...` : submitLabel}</Button>
                </div>
            </div>
        </form>
    );
}