import { useState } from 'react';
import { useIncomingFollowRequests } from '../../hooks/useIncomingFollowRequests';
import { useOutgoingFollowRequests } from '../../hooks/useOutgoingFollowRequests';
import styles from './FollowsPage.module.css';
import { ProfileHeader } from '../UserPage/UserPage';
import { UserCard } from '../../components/UserCard/UserCard';
import { useFollowers } from '../../hooks/useFollowers';
import { useFollowing } from '../../hooks/useFollowing';
import { useAuth } from '../../context/AuthContext';

export function FollowsPage() {
    const [activeTab, setActiveTab] = useState('incoming');
    const { user } = useAuth();

    const { data: incoming, isLoading: incomingLoading } = useIncomingFollowRequests();
    const { data: outgoing, isLoading: outgoingLoading } = useOutgoingFollowRequests();
    const { data: followers, isLoading: followersLoading } = useFollowers(user.username);
    const { data: following, isLoading: followingLoading } = useFollowing(user.username);

    const incomingCount = incoming?.length || 0;
    const outgoingCount = outgoing?.length || 0;
    const followersCount = followers?.length || 0;
    const followingCount = following?.length || 0;

    return (
        <div className={styles.container}>
            <ProfileHeader title="Follow Requests" />

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'incoming' ? styles.active : ''}`}
                    onClick={() => setActiveTab('incoming')}
                >
                    Received {incomingCount > 0 && <span className={styles.badge}>{incomingCount}</span>}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'outgoing' ? styles.active : ''}`}
                    onClick={() => setActiveTab('outgoing')}
                >
                    Sent {outgoingCount > 0 && <span className={styles.badge}>{outgoingCount}</span>}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'following' ? styles.active : ''}`}
                    onClick={() => setActiveTab('following')}
                >
                    Following {followingCount > 0 && <span className={styles.badge}>{followingCount}</span>}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'followers' ? styles.active : ''}`}
                    onClick={() => setActiveTab('followers')}
                >
                    Followers {followersCount > 0 && <span className={styles.badge}>{followersCount}</span>}
                </button>
            </div>


            {activeTab === 'incoming' && (
                <Requests
                    requests={incoming}
                    isLoading={incomingLoading}
                    type="incoming"
                />
            )}

            {activeTab === 'outgoing' && (
                <Requests
                    requests={outgoing}
                    isLoading={outgoingLoading}
                    type="outgoing"
                />
            )}

            {activeTab === 'following' && (
                <Requests
                    requests={following}
                    isLoading={followingLoading}
                    type="following"
                />
            )}
            {activeTab === 'followers' && (
                <Requests
                    requests={followers}
                    isLoading={followersLoading}
                    type="followers"
                />
            )}
        </div>
    );
}

function Requests({ requests, isLoading, type }) {
    if (isLoading) {
        return <span className="loader"></span>;
    }

    if (!requests || requests.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No {type} requests</p>
            </div>
        );
    }

    return (
        <>
            {requests.map(request => (
                <UserCard
                    key={request.id}
                    user={request}
                />
            ))}
        </>
    );
}
