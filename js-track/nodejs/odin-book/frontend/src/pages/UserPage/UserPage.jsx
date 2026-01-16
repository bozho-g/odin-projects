import { Outlet, useNavigate, useParams } from 'react-router-dom';
import styles from './UserPage.module.css';
import { PostsDashboard } from '../../components/Posts/PostsDashboard/PostsDashboard';
import { useFindUserByUsername } from '../../hooks/useFindUserByUsername';
import iconsUrl from "../../assets/icons.svg";
import { useAuth } from '../../context/AuthContext';
import { useEditProfile } from '../../context/EditProfileContext';
import { Button } from '../../components/Elements/Button/Button';
import { FollowAction } from '../../components/FollowAction';

export default function UserPage() {
    const { username } = useParams();
    const { user } = useAuth();
    const { openEditor } = useEditProfile();

    const navigate = useNavigate();

    const { data: profile, isLoading, isError } = useFindUserByUsername(username);
    const isOwner = user && profile && user.username === profile.username;

    if (isLoading) return <span className="loader" />;

    if (isError || !profile) {
        return <div className={styles.container}>
            <ProfileHeader title="Profile Not Found" />
            <p>The user you are looking for does not exist.</p>
        </div>;
    }

    return (
        <div className={styles.container}>
            <ProfileHeader title="Profile" />

            <div className={styles.profileInfo}>
                <img src={profile.pfpUrl || import.meta.env.VITE_DEFAULT_PFP_URL} alt={`${profile.username} pfp`} className={styles.pfp} />
                <div className={styles.userDetails}>
                    <h2>{profile.username}</h2>
                    <div className={styles.stats}>
                        <button onClick={() => navigate(`followers`, { replace: true })} className={styles.statLink}><strong>{profile._count.followers}</strong> Followers</button>
                        <button onClick={() => navigate(`following`, { replace: true })} className={styles.statLink}><strong>{profile._count.following}</strong> Following</button>
                    </div>
                    <span className={styles.joinedAt}>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                    })}</span>
                </div>
                <div className={styles.userActions}>
                    {isOwner && <Button onClick={openEditor}>Edit Profile</Button>}
                    {!isOwner && <FollowAction profile={profile} />}
                </div>
            </div>

            <div className={styles.userPosts}>
                <PostsDashboard filter={{ username }} />
            </div>

            <Outlet />
        </div >
    );
}

export function ProfileHeader({ title }) {
    const navigate = useNavigate();

    return (
        <div className={styles.profileHeader}>
            <svg className={styles.backButton} onClick={() => navigate(-1)}>
                <use href={`${iconsUrl}#icon-arrow-left`} />
            </svg>
            <h2>{title}</h2>
        </div>
    );
}