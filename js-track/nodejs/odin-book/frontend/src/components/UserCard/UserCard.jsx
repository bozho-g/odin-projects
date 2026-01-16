import { FollowAction } from "../FollowAction";
import styles from "./UserCard.module.css";
import { Link } from "react-router-dom";

export function UserCard({ user }) {
    return (
        <Link to={`/profile/${user.username}`} className={styles.userCard}>
            <img src={user.pfpUrl || import.meta.env.VITE_DEFAULT_PFP_URL} alt={`${user.username}'s profile`} className={styles.userPfp} />
            <span className={styles.username}>{user.username}</span>
            {<FollowAction profile={user} />}
        </Link>
    );
}