import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatPostDate } from '../../utils/date';
import { Link } from 'react-router-dom';
import iconsUrl from "../../assets/icons.svg?url";
import styles from '../Posts/PostCard/PostCard.module.css';
import { toast } from 'sonner';
import { ActionsDropdown } from '../Dropdowns/ActionsDropdown';
import { useToggleLikeComment } from '../../hooks/useToggleLikeComment';
import { useDeleteComment } from '../../hooks/useDeleteComment';
import { CommentForm } from './CommentForm.jsx/CommentForm';
import { useUpdateComment } from '../../hooks/useUpdateComment';

export function Comment({ comment }) {
    const { user } = useAuth();
    const [likesCount, setLikesCount] = useState(comment?._count?.likes ?? 0);
    const [liked, setLiked] = useState(comment?.likedByMe ?? false);
    const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditLoading, setIsEditLoading] = useState(false);
    const toggleLikeComment = useToggleLikeComment();
    const deleteComment = useDeleteComment();
    const updateComment = useUpdateComment();

    const isOwner = user?.id === comment.author.id;

    useEffect(() => {
        setLikesCount(comment?._count?.likes ?? 0);
    }, [comment?._count?.likes]);

    useEffect(() => {
        setLiked(comment?.likedByMe ?? false);
    }, [comment?.likedByMe]);

    async function toggleLike() {
        if (!user) return;

        const previousLiked = liked;
        const prevCount = likesCount;

        setLiked(!liked);
        setLikesCount(liked ? likesCount - 1 : likesCount + 1);

        if (toggleLikeComment.isPending) {
            return;
        }

        try {
            const response = await toggleLikeComment.mutateAsync({ commentId: comment.id });
            setLiked(response.liked);
            setLikesCount(response.likeCount);
        } catch {
            setLiked(previousLiked);
            setLikesCount(prevCount);
        }
    }

    async function handleDelete() {
        const deletePromise = deleteComment.mutateAsync(comment.id);

        toast.promise(deletePromise,
            {
                loading: "Deleting comment...",
                success: "Comment deleted successfully!",
                error: "Failed to delete comment."
            }
        );

        await deletePromise;
    }

    async function handleEdit({ content }) {
        if (!content || content === comment.content) {
            return;
        }

        setIsEditLoading(true);
        try {
            const updatePromise = (async () => {
                await updateComment.mutateAsync({ commentId: comment.id, content });
            })();

            toast.promise(updatePromise,
                {
                    loading: "Saving...",
                    success: "Comment updated successfully!",
                    error: "Failed to update comment. Please try again."
                }
            );

            await updatePromise;

            setIsEditing(false);
        } finally {
            setIsEditLoading(false);
        }
    }

    return (
        <article
            className={`${styles.postCard} ${styles.comment} ${isEditing ? styles.editing : ''}`}
        >
            <Link to={`/profile/${comment.author.username}`}>
                <img src={comment.author.pfpUrl || import.meta.env.VITE_DEFAULT_PFP_URL} alt="" className={styles.postPfp} />
            </Link>
            <div className={styles.postBody}>
                <div className={styles.postHeader}>
                    <Link to={`/profile/${comment.author.username}`} className={styles.postAuthor}>{comment.author.username}</Link>
                    <span className={styles.postDate}>{formatPostDate(comment.createdAt)}</span>
                    {isOwner && (
                        <svg data-no-nav className={styles.postOptionsIcon} onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setIsActionsDropdownOpen(o => !o);
                        }}>
                            <use href={`${iconsUrl}#icon-three-dots`} />
                        </svg>
                    )}
                    {isOwner && <ActionsDropdown isOpen={isActionsDropdownOpen} onClose={() => setIsActionsDropdownOpen(false)} setIsEditing={setIsEditing} onDelete={handleDelete} />}
                </div>
                <div className={styles.postContent}>
                    {isEditing ?
                        (<CommentForm onCancel={() => setIsEditing(false)} isEdit={true} initialContent={comment.content} onSubmit={handleEdit} isLoading={isEditLoading} />
                        ) : <p>{comment.content}</p>
                    }

                </div>
                <div className={styles.postActions}>
                    <button
                        onClick={toggleLike}
                        className={`${styles.likeCount} ${liked ? styles.liked : ''}`}
                        disabled={toggleLikeComment.isPending}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <use href={`${iconsUrl}#icon-heart${liked ? '-filled' : ''}`} />
                        </svg>
                        {likesCount}
                    </button>
                </div>
            </div>
        </article>
    );
}
