import { useState } from "react";
import { Button } from "../../Elements/Button/Button";
import { TextBox } from "../../Elements/TextBox/TextBox";
import styles from "./CommentForm.module.css";

export function CommentForm({ isEdit = false, onCancel = null, initialContent = "", onSubmit = null, isLoading = false }) {
    const [content, setContent] = useState(initialContent);

    async function handleSubmit(e) {
        e.preventDefault();
        if (onSubmit) {
            await onSubmit({ content: content.trim() });
            setContent("");
        }
    }

    return (
        <form className={`${styles.commentForm} ${isEdit ? styles.editing : ''}`} onSubmit={handleSubmit}>
            <TextBox placeholder={isEdit ? "Edit your comment" : "Post your reply"} value={content} onChange={setContent} />
            <div className={styles.formActions}>
                {isEdit && onCancel && (
                    <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
                )}
                <Button disabled={content.trim().length === 0 || isLoading} type="submit">{isEdit ? "Save" : "Comment"}</Button>
            </div>
        </form>
    );
}