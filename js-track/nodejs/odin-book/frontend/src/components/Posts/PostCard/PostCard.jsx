import { formatPostDate } from '../../../utils/date';
import styles from './PostCard.module.css';
import iconsUrl from "../../../assets/icons.svg?url";
import { useAuth } from '../../../context/AuthContext';
import { useToggleLikePost } from '../../../hooks/useToggleLikePost';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ActionsDropdown } from '../../Dropdowns/ActionsDropdown';
import { EditPostWrapper } from '../PostWrappers/EditPostWrapper';
import { useDeletePost } from '../../../hooks/useDeletePost';
import { toast } from 'sonner';

const DEFAULT_PFP = import.meta.env.VITE_DEFAULT_PFP_URL;

export function PostCard({ post }) {
    const navigate = useNavigate();

    const { user } = useAuth();
    const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const toggleLikePost = useToggleLikePost();
    const deletePost = useDeletePost();

    const isOwner = user?.id === post?.author?.id;
    const liked = post?.likedByMe ?? false;
    const likesCount = post?._count?.likes ?? 0;

    async function toggleLike() {
        if (!user) return;

        if (toggleLikePost.isPending) {
            return;
        }

        await toggleLikePost.mutateAsync({ postId: post.id });
    }

    function handleCardClick(e) {
        if (isEditing) {
            return;
        }

        const interactiveSelector = `
        a,
        button,
        input,
        textarea,
        select,
        [role="button"],
        [data-no-nav]
    `;

        if (e.target.closest(interactiveSelector)) {
            return;
        }

        navigate("/posts/" + post.id);
    }

    async function handleDelete() {
        const deletePromise = deletePost.mutateAsync(post.id);

        toast.promise(deletePromise,
            {
                loading: "Deleting post...",
                success: "Post deleted successfully!",
                error: "Failed to delete post."
            }
        );

        await deletePromise;
    }

    return (
        <article
            className={`${styles.postCard} ${isEditing ? styles.editing : ''}`}
            tabIndex={0}
            onClick={handleCardClick}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleCardClick(e);
                }
            }}
        >
            <Link to={`/profile/${post.author.username}`}>
                <img src={post.author.pfpUrl || DEFAULT_PFP} alt="" className={styles.postPfp} />
            </Link>
            <div className={styles.postBody}>
                <div className={styles.postHeader}>
                    <Link to={`/profile/${post.author.username}`} className={styles.postAuthor}>{post.author.username}</Link>
                    <span className={styles.postDate}>{formatPostDate(post.createdAt)}</span>
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
                        (<EditPostWrapper post={post} onCancel={() => setIsEditing(false)} />
                        ) : (
                            <>
                                {post?.content && <p>{post.content}</p>}
                                {post.imageUrl && <img src={post.imageUrl} alt="Post image" className={styles.postImage} />}
                            </>
                        )}
                </div>
                <div className={styles.postActions}>
                    <button
                        onClick={toggleLike}
                        className={`${styles.likeCount} ${liked ? styles.liked : ''}`}
                        disabled={toggleLikePost.isPending}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <use href={`${iconsUrl}#icon-heart${liked ? '-filled' : ''}`} />
                        </svg>
                        {likesCount}
                    </button>
                    <Link to={`/posts/${post.id}`} className={styles.commentCount}>
                        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                            <use href={`${iconsUrl}#icon-comment`} />
                        </svg>
                        {post._count.comments}
                    </Link>
                </div>
            </div>
        </article>
    );
}