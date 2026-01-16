import { useCancelFollowRequest } from "../hooks/useCancelFollowRequest";
import { useRemoveFollower } from "../hooks/useRemoveFollower";
import { useRespondToRequest } from "../hooks/useRespondToRequest";
import { useSendFollowRequest } from "../hooks/useSendFollowRequest";
import { useUnfollowUser } from "../hooks/useUnfollowUser";
import { Button } from "./Elements/Button/Button";

function stopLink(e) {
    e.preventDefault();
    e.stopPropagation();
}

const buttonsStyle = {
    display: 'flex',
    gap: '0.5rem',
};

export function FollowAction({ profile }) {
    const sendFollowRequest = useSendFollowRequest();
    const cancelFollowRequest = useCancelFollowRequest();
    const respondToFollowRequest = useRespondToRequest();
    const unfollowUser = useUnfollowUser();
    const removeFollower = useRemoveFollower();

    const isLoading = sendFollowRequest.isPending ||
        cancelFollowRequest.isPending ||
        respondToFollowRequest.isPending ||
        unfollowUser.isPending ||
        removeFollower.isPending;

    switch (profile.followStatus) {
        case "self":
            return null;

        case "none":
            return <Button disabled={isLoading}
                onClick={(e) => {
                    stopLink(e);
                    sendFollowRequest.mutate(profile.id);
                }}>
                Follow
            </Button>;

        case "mutual_accepted":
            return <div style={buttonsStyle}>
                <Button disabled={isLoading} variant="secondary" onClick={(e) => {
                    stopLink(e);
                    unfollowUser.mutate(profile.id);
                }}>
                    Unfollow
                </Button>
                <Button disabled={isLoading}
                    onClick={(e) => {
                        stopLink(e);
                        removeFollower.mutate(profile.id);
                    }}>Remove</Button>
            </div>;

        case "incoming_pending_followee":
            return <div style={buttonsStyle}>
                <Button disabled={isLoading} onClick={(e) => {
                    stopLink(e);
                    respondToFollowRequest.mutate({ userId: profile.id, accept: true });
                }}>Accept</Button>

                <Button disabled={isLoading} variant="secondary" onClick={(e) => {
                    stopLink(e);
                    respondToFollowRequest.mutate({ userId: profile.id, accept: false });
                }}>Decline</Button>

                <Button disabled={isLoading} variant="secondary" onClick={(e) => {
                    stopLink(e);
                    unfollowUser.mutate(profile.id);
                }}>
                    Unfollow
                </Button>
            </div>;

        case "followee_accepted":
            return <Button disabled={isLoading} variant="secondary" onClick={(e) => {
                stopLink(e);
                unfollowUser.mutate(profile.id);
            }}>Unfollow</Button>;

        case "outgoing_pending_follower":
            return <div style={buttonsStyle}>
                <Button disabled={isLoading} variant="secondary" onClick={(e) => {
                    stopLink(e);
                    cancelFollowRequest.mutate(profile.id);
                }}>Cancel Request</Button>

                <Button disabled={isLoading} variant="secondary" onClick={(e) => {
                    stopLink(e);
                    removeFollower.mutate(profile.id);
                }}>Remove</Button>
            </div>;

        case "follower_accepted":
            return <div style={buttonsStyle}>
                <Button disabled={isLoading} onClick={(e) => {
                    stopLink(e);
                    sendFollowRequest.mutate(profile.id);
                }}>Follow Back</Button>

                <Button disabled={isLoading} variant="secondary" onClick={(e) => {
                    stopLink(e);
                    removeFollower.mutate(profile.id);
                }}>Remove</Button>
            </div>;

        case "outgoing_pending":
            return <Button disabled={isLoading} variant="secondary" onClick={(e) => {
                stopLink(e);
                cancelFollowRequest.mutate(profile.id);
            }}>Cancel Request</Button>;

        case "incoming_pending":
            return (
                <div style={buttonsStyle}>
                    <Button disabled={isLoading} onClick={(e) => {
                        stopLink(e);
                        respondToFollowRequest.mutate({ userId: profile.id, accept: true });
                    }}>Accept</Button>

                    <Button disabled={isLoading} variant="secondary" onClick={(e) => {
                        stopLink(e);
                        respondToFollowRequest.mutate({ userId: profile.id, accept: false });
                    }}>Decline</Button>
                </div>
            );

        case "mutual_pending":
            return <div style={buttonsStyle}>
                <Button disabled={isLoading} onClick={(e) => {
                    stopLink(e);
                    cancelFollowRequest.mutate(profile.id);
                }}>Cancel Request</Button>

                <Button disabled={isLoading} onClick={(e) => {
                    stopLink(e);
                    respondToFollowRequest.mutate({ userId: profile.id, accept: true });
                }}>Accept</Button>

                <Button disabled={isLoading} variant="secondary" onClick={(e) => {
                    stopLink(e);
                    respondToFollowRequest.mutate({ userId: profile.id, accept: false });
                }}>Decline</Button>
            </div>;

        default:
            return null;
    }
}