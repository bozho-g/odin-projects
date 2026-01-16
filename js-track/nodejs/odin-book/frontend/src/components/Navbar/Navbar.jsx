import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from '/src/assets/odin_logo.png';
import styles from './Navbar.module.css';
import iconsUrl from "../../assets/icons.svg?url";
import { UserDropdown } from "../Dropdowns/UserDropdown";
import { useState } from "react";

const DEFAULT_PFP_URL = import.meta.env.VITE_DEFAULT_PFP_URL;

export function Navbar() {
    const { user } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <nav className={styles.navbar}>
            <div>
                <Link to="/" className={styles.link}><img src={logo} alt="Odin Book Logo" className={styles.logo} /></Link>
            </div>
            <div className={styles.links}>
                <NavLink to="/" className={({ isActive }) => isActive ? styles.activeLink : styles.link}><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><use href={`${iconsUrl}#icon-home`} /></svg>
                    Home</NavLink>

                <NavLink to="/users" className={({ isActive }) => isActive ? styles.activeLink : styles.link}><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><use href={`${iconsUrl}#icon-search`} /></svg>Users</NavLink>

                <NavLink to="follows" className={({ isActive }) => isActive ? styles.activeLink : styles.link}><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><use href={`${iconsUrl}#icon-followers`} /></svg>Follows</NavLink>

                <NavLink to={`/profile/${user?.username}`} className={({ isActive }) => isActive ? styles.activeLink : styles.link}><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><use href={`${iconsUrl}#icon-profile`} /></svg>Profile</NavLink>
            </div>

            <div className={styles.userContent}>
                <>
                    <UserDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} />
                    <div className={`${styles.userSection} ${styles.link}`} onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}>
                        <img src={user?.pfpUrl || DEFAULT_PFP_URL} alt={user?.username || "User"} />
                        <div className={styles.userInfo}>
                            <p>{user?.username}</p>
                            <p>@{user?.username}</p>
                        </div>
                        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href={`${iconsUrl}#icon-dots`} /></svg>
                    </div>
                </>
            </div>
        </nav>
    );
}