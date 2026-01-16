import { useCallback, useEffect, useState } from 'react';
import styles from './Modal.module.css';
import iconsUrl from "../../assets/icons.svg?url";

export function Modal({ title, onClose, children, isOpen }) {
    const [isClosing, setIsClosing] = useState(false);

    const requestClose = useCallback(() => {
        setIsClosing(true);

        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 200);
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleEscape = (e) => {
            if (e.key === "Escape") {
                requestClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, requestClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className={`${styles.overlay} ${isClosing ? styles.closing : ''}`} onClick={requestClose}>
            <div className={`${styles.modal} ${isClosing ? styles.closing : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={requestClose}
                        aria-label="Close modal"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href={`${iconsUrl}#icon-close`} /></svg>
                    </button>
                </div>
                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
}