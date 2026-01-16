import iconsUrl from "../../assets/icons.svg?url";
import { Dropdown } from "./Dropdown";
import styles from './Dropdown.module.css';

export function ActionsDropdown({ isOpen, onClose, onDelete, setIsEditing }) {
    return (
        <Dropdown isOpen={isOpen} onClose={onClose} className={styles.actionsDropdown}>
            <button className={styles.dropdownItem} onClick={() => { onClose(); setIsEditing(true); }}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <use href={`${iconsUrl}#icon-edit`} />
                </svg>
                Edit
            </button>
            <button className={`${styles.dropdownItem} ${styles.destructiveItem}`} onClick={() => { onClose(); onDelete(); }}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <use href={`${iconsUrl}#icon-delete`} />
                </svg>
                Delete</button>
        </Dropdown>
    );
};