import { useNavigate, useParams } from 'react-router-dom';
import { Modal } from '../Modal/Modal';
import styles from './FollowsModal.module.css';
import { useFollowers } from '../../hooks/useFollowers';
import { useFollowing } from '../../hooks/useFollowing';
import { UserCard } from '../UserCard/UserCard';

export function FollowsModal({ type }) {
    const username = useParams().username;
    const navigate = useNavigate();

    const followers = useFollowers(username, type === 'followers');
    const following = useFollowing(username, type === 'following');

    const { data: users, error } = type === 'followers' ? followers : following;
    const isLoading = type === 'followers' ? followers.isLoading : following.isLoading;

    return <Modal
        isOpen={true}
        title={type === 'followers' ? 'Followers' : 'Following'}
        onClose={() => navigate('/profile/' + username, { replace: true })}
    >

        {isLoading ?
            <div className={styles.loadingContainer}>
                <span className="loader" />
            </div>
            :
            <div className={styles.container}>
                {error && <p>Error loading {type}.</p>}

                {users && users.length === 0 ? <p>No {type} found.</p> : null}

                {users && users.length > 0 &&
                    users.map((user) => (
                        <UserCard key={user.id} user={user} />
                    )
                    )}
            </div>
        }
    </Modal>;
};