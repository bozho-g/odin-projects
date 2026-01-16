import iconsUrl from "../../assets/icons.svg?url";
import { useAuth } from "../../context/AuthContext";
import { useEditProfile } from "../../context/EditProfileContext";
import { Dropdown } from "./Dropdown";
import styles from './Dropdown.module.css';

export function UserDropdown({ isOpen, onClose }) {
    const { logout } = useAuth();
    const { openEditor } = useEditProfile();

    return (
        <Dropdown isOpen={isOpen} onClose={onClose} className={styles.userDropdown}>
            <button className={styles.dropdownItem} onClick={openEditor}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <use href={`${iconsUrl}#icon-settings`} />
                </svg>
                Edit Profile
            </button>
            <button className={`${styles.dropdownItem} ${styles.destructiveItem}`} onClick={logout}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <use href={`${iconsUrl}#icon-logout`} />
                </svg>
                Logout</button>
        </Dropdown>
    );
}