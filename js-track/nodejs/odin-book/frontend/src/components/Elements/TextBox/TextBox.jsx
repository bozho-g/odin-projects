import { useEffect, useRef } from "react";
import styles from "./TextBox.module.css";

export function TextBox({ value = "", onChange, placeholder = "What's on your mind?" }) {
    const textareaRef = useRef(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 250) + "px";
    }, [value]);

    return (
        <div className={styles.wrapper}>
            <textarea ref={textareaRef} name="content" id="content" placeholder={placeholder} className={styles.textarea} value={value} onChange={(e) => {
                if (e.target.value.length <= 500) {
                    onChange(e.target.value);
                }
            }}></textarea>
            <span className={styles.charCount}>{value.length} / 500</span>
        </div>
    );
}