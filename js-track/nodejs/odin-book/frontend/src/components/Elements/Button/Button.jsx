import styles from "./button.module.css";

export function Button({ variant = "primary", className = "", ...props }) {
    return (
        <button
            className={`${styles.base} ${styles[variant]} ${className}`}
            {...props}
        />
    );
}