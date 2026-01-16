import { useParams } from "react-router-dom";
import { ProfileHeader } from "../UserPage/UserPage";
import styles from './PostPage.module.css';
import { usePost } from "../../hooks/usePost";
import { PostCard } from "../../components/Posts/PostCard/PostCard";
import { CommentsDashboard } from "../../components/Comments/CommentsDashboard/CommentsDashboard";
import { CommentForm } from "../../components/Comments/CommentForm.jsx/CommentForm";
import { useCreateComment } from "../../hooks/useCreateComment";
import { useState } from "react";
import { toast } from "sonner";

export function PostPage() {
    const postId = useParams().postId;
    const { data: post, isLoading: areCommentsLoading, isError } = usePost(postId);

    const [isLoading, setIsLoading] = useState(false);
    const createCommentMutation = useCreateComment();

    if (areCommentsLoading) return <span className="loader" />;

    if (isError || !post) {
        return <div className={styles.container}>
            <ProfileHeader title="Post Not Found" />
            <p>The post you are looking for does not exist.</p>
        </div>;
    }

    async function handleSubmit({ content }) {
        if (!content) {
            return;
        }
        try {
            setIsLoading(true);

            const createPromise = (async () => {
                await createCommentMutation.mutateAsync({ postId: post.id, content });
            })();

            toast.promise(createPromise,
                {
                    loading: "Commenting...",
                    success: "Comment added successfully!",
                    error: "Failed to add comment. Please try again."
                }
            );

            await createPromise;
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.container}>
            <ProfileHeader title="Post" />
            <PostCard post={post} />
            <CommentForm onSubmit={handleSubmit} isLoading={isLoading} />
            <CommentsDashboard postId={postId} />
        </div>
    );
}